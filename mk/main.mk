default: help

# Paths

NODE_BINDIR ?= ./node_modules/.bin/
SHELL ?= /bin/bash -o pipefail
SYSTEMATIC_PATH ?= node_modules/systematic/
WEBPACK ?= ./node_modules/webpack/bin/webpack.js
WEBPACK_DIST_OPTS := $(if $(CI),,--progress)

CONF_INI ?= systematic.ini
INI2JS ?= $(NODE_BINDIR)ini2js

# Inspired from http://stackoverflow.com/questions/22550265/read-certain-key-from-certain-section-of-ini-file-sed-awk
define readini
$(shell sed -ne '/\[$(2)\]/,/\[/ {/$(3)/p; }' $(1) | sed -ne 's/^[[:space:]]*$(3)[[:space:]]*=[[:space:]]*//p')
endef

define read_package
$(shell node -p "require('./package.json').$(1)")
endef

# On OSX the PATH variable isn't exported unless "SHELL" is also set, see: http://stackoverflow.com/a/25506676
SHELL = /bin/bash
export PATH := $(NODE_BINDIR):$(PATH)
export NODE_PATH := $(shell pwd):$(NODE_PATH)

# Variables customizable through systematic.ini

BUILD_PROFILE ?= $(call readini,$(CONF_INI),build,profile)
BUILD_PROFILE := $(if $(BUILD_PROFILE),$(BUILD_PROFILE),vanilla)
BUILD_TYPE ?= $(call readini,$(CONF_INI),build,type)
PACKAGE_NAME ?= $(call read_package,name)
PACKAGE_AUTHOR ?= $(call read_package,author)

ifeq ($(BUILD_PROFILE),)
$(error Please define a build.profile in $(CONF_INI))
endif
ifeq ($(PACKAGE_NAME),)
$(error Please define a package name in $(CONF_INI))
endif
ifeq ($(PACKAGE_AUTHOR),)
$(error Please define a package author in package.json (used in translation files))
endif

SRC_DIR := $(call readini,$(CONF_INI),build,src_dir)
SRC_DIR := $(if $(SRC_DIR),$(SRC_DIR),src)

OUTPUT_DIR := $(call readini,$(CONF_INI),build,output_dir)
OUTPUT_DIR := $(if $(OUTPUT_DIR),$(OUTPUT_DIR),dist)

SERVE_HOST := $(call readini,$(CONF_INI),serve,host)
SERVE_HOST := $(if $(SERVE_HOST),$(SERVE_HOST),0.0.0.0)

SERVE_PORT := $(call readini,$(CONF_INI),serve,port)
SERVE_PORT := $(if $(SERVE_PORT),$(SERVE_PORT),8080)

WEBPACK_EXTRA_OPTIONS ?=

TEST_PORT ?= 8081

# webpack default config

ifeq ($(wildcard webpack.config.js),)
WEBPACK_OPTIONS_CONFIG_FILE ?= --config $(SYSTEMATIC_PATH)default_config/webpack.config.js
endif

# testing default config

TEST_ENGINE ?= $(call readini,$(CONF_INI),test,engine)
TEST_ENGINE := $(if $(TEST_ENGINE),$(TEST_ENGINE),karma)

ifeq ($(TEST_ENGINE),karma)
	ifeq ($(wildcard karma.conf.js),)
		KARMA_OPTIONS_CONFIG_FILE ?= $(SYSTEMATIC_PATH)default_config/karma.conf.js
	else
		KARMA_OPTIONS_CONFIG_FILE ?= karma.conf.js
	endif
endif
ifeq ($(TEST_ENGINE),jest)
	ifeq ($(wildcard jest.conf.js),)
		JEST_OPTIONS_CONFIG_FILE ?= $(SYSTEMATIC_PATH)default_config/jest.conf.js
	else
		JEST_OPTIONS_CONFIG_FILE ?= jest.conf.js
	endif
endif

# Other variables

ESLINTRC ?= ./$(SYSTEMATIC_PATH).eslintrc
ESLINTOPTIONS ?=

LOCALES ?= $(call readini,$(CONF_INI),build,locales)
LOCALE_FILES ?= $(patsubst %,locale/%/LC_MESSAGES/app.po,$(LOCALES))

GETTEXT_HTML_SOURCES ?= $(shell find $(SRC_DIR) -name '*.jade' -o -name '*.html' 2> /dev/null)
GETTEXT_JS_SOURCES   ?= $(shell find $(SRC_DIR) -name '*.js')
SETTINGS_INI_FILES ?= $(shell find $(SRC_DIR) -name '*.ini' 2> /dev/null)

# Colors for a nicer output
ECHOPREFIX ?= $(shell tput setaf 2)--- [make]
ECHOSUFFIX ?= $(shell tput sgr 0)

include $(SYSTEMATIC_PATH)mk/$(BUILD_PROFILE).mk


# Help Message
#
define helpmsg
Makefile command help

The following commands are available.

    help                    Displays this message.

    clean                   Cleanup intermediate build files.

    update                  Update node packages locally
    makemessages            Extract translation tokens from JS, Jade & HTML files.
    prepare                 Execute all pre-build actions (translations, settings)

    serve                   Build in development mode, serve and watch.
    dist                    Bundles the package for distribution.

    syntax                  Check application style and syntax with eslint.
    test                    Runs a single run of the tests and syntax.
    livetest                Runs continous tests with complete source maps, without syntax check.
    jenkins-test            Runs tests on jenkins.

endef


# Makefile Targets
#
.PHONY: default help update makemessages prepare settings translations
.PHONY: serve dist syntax test livetest jenkins-test test-browser

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
	eslint --config $(ESLINTRC) $(ESLINTOPTIONS) $(SRC_DIR)

test:
ifeq ($(TEST_ENGINE),karma)
	karma start --reporters webpack-error --single-run --no-auto-watch $(KARMA_OPTIONS_CONFIG_FILE)
endif
ifeq ($(TEST_ENGINE),jest)
	jest --config=$(JEST_OPTIONS_CONFIG_FILE) --no-cache
endif

jenkins-test: prepare syntax
ifeq ($(TEST_ENGINE),karma)
	karma start --reporters junit,webpack-error --single-run --no-auto-watch --no-colors $(KARMA_OPTIONS_CONFIG_FILE)
endif
ifeq ($(TEST_ENGINE),jest)
	JEST_JUNIT_OUTPUT='./reports/TEST-jest.xml' JEST_JUNIT_CLASSNAME="{classname}" JEST_JUNIT_TITLE="{title}" jest --ci --reporters=default --reporters=jest-junit --config=$(JEST_OPTIONS_CONFIG_FILE) --no-cache
endif

livetest: prepare
ifeq ($(TEST_ENGINE),karma)
	karma start --reporters webpack-error,kjhtml --no-single-run --devtool source-map $(KARMA_OPTIONS_CONFIG_FILE)
endif
ifeq ($(TEST_ENGINE),jest)
	jest --reporters kjhtml --config=$(JEST_OPTIONS_CONFIG_FILE)
endif

makemessages: /tmp/template.pot

translations: $(OUTPUT_DIR)/translations.json

settings: $(OUTPUT_DIR)/app.settings.js

serve: prepare
	mkdir -p $(OUTPUT_DIR)
	webpack-dev-server --mode development $(WEBPACK_OPTIONS_CONFIG_FILE) --content-base $(OUTPUT_DIR) --hot --inline \
		--port $(SERVE_PORT) --host $(SERVE_HOST) \
		--colors --bail --progress --output-pathinfo \
		$(WEBPACK_EXTRA_OPTIONS)

# Don't minify because it causes issues, see https://github.com/Polyconseil/systematic/issues/13
dist: prepare
ifeq ($(BUILD_TYPE),library)
	@echo "Doing nothing, it's a library. Export the entry point in your package.json!"
else
	mkdir -p $(OUTPUT_DIR)
	NODE_ENV=production webpack --mode production $(WEBPACK_OPTIONS_CONFIG_FILE) \
		--no-color --bail --display-modules \
		$(WEBPACK_DIST_OPTS) $(WEBPACK_EXTRA_OPTIONS)
endif

# Miscellaneous build commands

$(OUTPUT_DIR)/app.settings.js: $(SETTINGS_INI_FILES)
ifeq ($(BUILD_TYPE),application)
	mkdir -p $(dir $@)
	@echo "$(ECHOPREFIX) generating '$(notdir $@)' $(ECHOSUFFIX)"
	$(INI2JS) $^ --global_name __SETTINGS__ > $@
endif

/tmp/template.pot: $(GETTEXT_JS_SOURCES) $(GETTEXT_HTML_SOURCES)
	@echo "$(ECHOPREFIX) extracting translations $(ECHOSUFFIX)"
	mkdir -p $(dir $@)
	gettext-extract --quiet $(GETTEXTEXTRACT_OPTIONS) --output $@ $(GETTEXT_HTML_SOURCES)
	xgettext --language=JavaScript --keyword=i18n --keyword=npgettext:1c,2,3 --from-code=utf-8 \
		--sort-output --join-existing --no-wrap --package-name=$(PACKAGE_NAME) \
		--package-version=$(shell node -e "console.log(require('./package.json').version);") \
		--copyright="$(PACKAGE_AUTHOR)" --output $@ $(GETTEXT_JS_SOURCES)
	# Remove comments
	sed -i.bak '/^#:/ d' $@ && rm $@.bak
	@for lang in $(LOCALES); do \
		export PO_FILE=locale/$$lang/LC_MESSAGES/app.po; \
		echo "msgmerge --sort-output --update $$PO_FILE $@"; \
		mkdir -p $$(dirname $$PO_FILE); \
		[ -f $$PO_FILE ] && msgmerge --lang=$$lang --sort-output --update $$PO_FILE $@ || msginit --no-translator --locale=$$lang --input=$@ -o $$PO_FILE; \
		msgattrib --no-wrap --no-location --no-obsolete -o $$PO_FILE $$PO_FILE; \
	done;
	rm $@

$(OUTPUT_DIR)/translations.json: $(LOCALE_FILES)
	mkdir -p $(dir $@)
	gettext-compile --output $@ $^
