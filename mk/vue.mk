GETTEXT_HTML_SOURCES := $(shell find $(SRC_DIR) -name '*.jade' -o -name '*.html' -o -name '*.vue' 2> /dev/null)
GETTEXT_JS_SOURCES := $(shell find $(SRC_DIR) -name '*.js' -o -name '*.vue')

GETTEXTEXTRACT_OPTIONS := --attribute='v-translate'
ESLINTOPTIONS := --ext .js,.vue --plugin html
