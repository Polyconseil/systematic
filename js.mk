default: help

PATH := node_modules/.bin:$(PATH)
SHELL ?= /bin/bash -o pipefail

export NODE_PATH := $(shell pwd):$(NODE_PATH)

# Customizable variables
#
IS_APP ?= no

SRC_DIR ?= src
DIST_DIR ?= dist
SERVE_PORT ?= 8080
TEST_PORT ?= 8081

ESLINTRC ?= ./node_modules/systematic/.eslintrc

LOCALES ?= en_US en_GB es_US fr_FR it_IT
LOCALE_FILES ?= $(patsubst %,locale/%/LC_MESSAGES/app.po,$(LOCALES))

GETTEXT_HTML_SOURCES ?= $(shell find $(SRC_DIR) -name '*.jade' -o -name '*.html' 2> /dev/null)
GETTEXT_JS_SOURCES ?= $(shell find $(SRC_DIR) -name '*.js' 2> /dev/null)


# Help Message
#
define helpmsg
Makefile command help

The following commands are available.

    help                 		Display this message.

    clean                   Cleanup intermediate build files.

    update                  Update node packages locally
    makemessages            Extract translation tokens from JS, Jade & HTML files.
    prepare                 Update and extract translation tokens.

    serve                   Build in development mode, serve and watch.
    dist                    Bundles the package for distribution.

    syntax                  Check application style and syntax with eslint.
    test                    Runs a single run of the tests and syntax.
    livetest                Runs continous tests.
    jenkins-test            Runs tests on jenkins.
    test-browser            Spawns a server that you can access from any browser.

endef


# Makefile Targets
#
.PHONY: default help update makemessages prepare
.PHONY: serve dist syntax test livetest jenkins-test test-browser

help:
	@echo ""
	$(info $(helpmsg))

clean:
	rm -f /tmp/template.pot $(SRC_DIR)/translations.json
	rm -rf $(DIST_DIR) reports/

prepare: update makemessages

update:
	npm install

syntax: eslint

eslint:
	eslint --config $(ESLINTRC) $(SRC_DIR)

test: syntax
	karma start --single-run --no-auto-watch karma.conf.js

livetest: syntax
	karma start --no-single-run karma.conf.js

test-browser: syntax
	karma start --port $(TEST_PORT) --reporters kjhtml --browsers '' karma.conf.js

jenkins-test: syntax
	karma start --single-run --no-auto-watch --no-colors --reporters junit,mocha,coverage karma.conf.js

makemessages: /tmp/template.pot

translations: $(SRC_DIR)/translations.json

serve: translations
	mkdir -p $(DIST_DIR)
	concurrent --kill-others \
		"live-server --port=$(SERVE_PORT) --wait=100 --watch=$(SRC_DIR) --open=$(SRC_DIR)" \
		"webpack --watch --bail"

dist: translations
	mkdir -p $(DIST_DIR)
	cp $(SRC_DIR)/translations.json $(DIST_DIR)/translations.json
	webpack --optimize-minimize --optimize-dedupe --progress
ifeq ($(IS_APP),yes)
	html-dist $(SRC_DIR)/index.html --remove-all --minify \
		--insert bundle.js --output $(DIST_DIR)/index.html
endif


# Miscellaneous build commands
#

/tmp/template.pot: $(GETTEXT_JS_SOURCES) $(GETTEXT_JS_SOURCES)
	mkdir -p $(dir $@)
	gettext-extract --output $@ $(GETTEXT_HTML_SOURCES)
	xgettext --language=JavaScript --keyword=i18n --from-code=utf-8 \
		--sort-output --join-existing --no-wrap --package-name=$(PACKAGE) \
		--package-version=$(shell node -e "console.log(require('./package.json').version);") \
		--copyright=POLYCONSEIL --output $@ $(GETTEXT_JS_SOURCES)
	# Remove comments
	sed -i.bak '/^#:/ d' $@ && rm $@.bak
	@for lang in $(LOCALES); do \
		export PO_FILE=locale/$$lang/LC_MESSAGES/app.po; \
		echo "msgmerge --sort-output --update $$PO_FILE $@"; \
		mkdir -p $$(dirname $$PO_FILE); \
		[ -f $$PO_FILE ] && msgmerge --lang=$$lang --sort-output --update $$PO_FILE $@ || msginit --no-translator --locale=$$lang --input=$@ -o $$PO_FILE; \
		msgattrib --no-wrap --no-location --no-obsolete -o $$PO_FILE $$PO_FILE; \
	done;

$(SRC_DIR)/translations.json: /tmp/template.pot
	gettext-compile --output $@ $(LOCALE_FILES)
