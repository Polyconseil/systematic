default: help

# Paths

PATH := node_modules/.bin:$(PATH)
NODE_BINDIR ?= ./node_modules/.bin/
SHELL ?= /bin/bash -o pipefail
SYSTEMATIC_PATH ?= node_modules/systematic
WEBPACK ?= ./node_modules/webpack/bin/webpack.js
WEBPACK_DEV_SERVER ?= ./node_modules/webpack-dev-server/bin/webpack-dev-server.js
WEBPACK_DIST_OPTS := $(if $(CI),,--progress)

CONF_INI ?= systematic.ini
INI2JS ?= $(NODE_BINDIR)ini2js

# Inspired from http://stackoverflow.com/questions/22550265/read-certain-key-from-certain-section-of-ini-file-sed-awk
define readini
$(shell sed -nr '/\[$(2)\]/,/\[/{/$(3)/p}' $(1) | sed -ne 's/^\s*$(3)\s*=\s*//p')
endef

export NODE_PATH := $(shell pwd):$(NODE_PATH)

# Variables customizable through systematic.ini

BUILD_PROFILE ?= $(call readini,$(CONF_INI),build,profile)
BUILD_TYPE ?= $(call readini,$(CONF_INI),build,type)
PACKAGE_NAME ?= $(call readini,$(CONF_INI),package,name)

ifeq ($(BUILD_PROFILE),)
$(error Please define a build.profile in $(CONF_INI))
endif
ifeq ($(PACKAGE_NAME),)
$(error Please define a package name in $(CONF_INI))
endif

SRC_DIR := $(call readini,$(CONF_INI),build,src_dir)
SRC_DIR := $(if $(SRC_DIR),$(SRC_DIR),src)

OUTPUT_DIR := $(call readini,$(CONF_INI),build,output_dir)
OUTPUT_DIR := $(if $(OUTPUT_DIR),$(OUTPUT_DIR),dist)

SERVE_PORT := $(call readini,$(CONF_INI),serve,port)
SERVE_PORT := $(if $(SERVE_PORT),$(SERVE_PORT),8080)

TEST_PORT ?= 8081

# Other variables

# webpack can need more memory than the default 512mo of node
NODE_MEMORY ?= 4096
ESLINTRC ?= ./$(SYSTEMATIC_PATH)/.eslintrc

LOCALES ?= en_US en_GB es_US fr_FR it_IT
LOCALE_FILES ?= $(patsubst %,locale/%/LC_MESSAGES/app.po,$(LOCALES))

GETTEXT_HTML_SOURCES ?= $(shell find $(SRC_DIR) -name '*.jade' -o -name '*.html' 2> /dev/null)
GETTEXT_JS_SOURCES   ?= $(shell find $(SRC_DIR) -name '*.js')
SETTINGS_INI_FILES := $(shell find $(SRC_DIR)/settings -name '*.ini' 2> /dev/null)

# Colors for a nicer output
ECHOPREFIX ?= $(shell tput setaf 2)--- [make]
ECHOSUFFIX ?= $(shell tput sgr 0)

include $(SYSTEMATIC_PATH)/mk/$(BUILD_PROFILE).mk


# Help Message
#
define helpmsg
Makefile command help

The following commands are available.

    help                    Displays this message.

    clean                   Cleanup intermediate build files.

    update                  Update node packages locally
    makemessages            Extract translation tokens from JS, Jade & HTML files.
    prepare                 Execute all pre-build actions (translations, settings...)

    serve                   Build in development mode, serve and watch.
    serve-dist              Bundles the package for distribution and serves it.
    dist                    Bundles the package for distribution.

    syntax                  Check application style and syntax with eslint.
    test                    Runs a single run of the tests and syntax.
    livetest                Runs continous tests.
    livetest-debug          Runs continous tests with complete source maps, without syntax check.
    jenkins-test            Runs tests on jenkins.
    test-browser            Spawns a server that you can access from any browser.

endef


# Makefile Targets
#
.PHONY: default help update makemessages prepare settings
.PHONY: serve dist serve-dist syntax test livetest jenkins-test test-browser

help:
	@echo ""
	$(info $(helpmsg))

clean:
	rm -f /tmp/template.pot $(OUTPUT_DIR)/translations.json
	rm -rf $(OUTPUT_DIR) reports/

prepare: translations settings

update:
	npm install

syntax: eslint

eslint:
	eslint --config $(ESLINTRC) $(SRC_DIR)

test: prepare syntax
	karma start --single-run --no-auto-watch karma.conf.js

livetest: prepare syntax
	karma start --no-single-run karma.conf.js

livetest-debug: prepare
	karma start --no-single-run karma.conf.js --devtool source-map --reporters mocha,kjhtml

test-browser: prepare syntax
	karma start --port $(TEST_PORT) --reporters kjhtml --browsers '' karma.conf.js

jenkins-test: prepare syntax
	karma start --single-run --no-auto-watch --no-colors --reporters junit,mocha,coverage karma.conf.js

makemessages: /tmp/template.pot

translations: $(OUTPUT_DIR)/translations.json
settings: $(OUTPUT_DIR)/app.settings.js

serve: prepare
	mkdir -p $(OUTPUT_DIR)
	# TODO: Switch to webpack 2, for the --open option to work
	node --max_old_space_size=$(NODE_MEMORY) $(WEBPACK_DEV_SERVER) \
		--content-base $(OUTPUT_DIR) --hot --inline --open --port $(SERVE_PORT) --host 127.0.0.1 --colors \
		--bail --progress --output-pathinfo --devtool cheap-module-source-map --display-error-details

dist: prepare
	mkdir -p $(OUTPUT_DIR)
	# Minification caused issues
	SYSTEMATIC_BUILD_MODE=PROD node --max_old_space_size=$(NODE_MEMORY) $(WEBPACK) \
		--optimize-dedupe --optimize-occurence-order $(WEBPACK_DIST_OPTS) # --optimize-minimize

serve-dist: dist
	$(NODE_BINDIR)http-server ./$(OUTPUT_DIR) -p $(TEST_PORT) -o


# Miscellaneous build commands

$(OUTPUT_DIR)/app.settings.js: $(SETTINGS_INI_FILES)
ifeq ($(BUILD_TYPE),application)
	@echo "$(ECHOPREFIX) generating 'app.settings.js' $(ECHOSUFFIX)"
	mkdir -p $(OUTPUT_DIR)
	$(INI2JS) $^ --global_name app_settings > $@
endif

/tmp/template.pot: $(GETTEXT_JS_SOURCES) $(GETTEXT_HTML_SOURCES)
	@echo "$(ECHOPREFIX) extracting translations $(ECHOSUFFIX)"
	mkdir -p $(dir $@)
	gettext-extract --output $@ $(GETTEXT_HTML_SOURCES)
	xgettext --language=JavaScript --keyword=i18n --from-code=utf-8 \
		--sort-output --join-existing --no-wrap --package-name=$(PACKAGE_NAME) \
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

$(OUTPUT_DIR)/translations.json: /tmp/template.pot
	mkdir -p $(OUTPUT_DIR)
	gettext-compile --output $@ $(LOCALE_FILES)
