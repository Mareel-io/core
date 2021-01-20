SUBDIRS := $(wildcard */.)
NEARLEYC := $(CURDIR)/../../node_modules/.bin/nearleyc

all: $(SUBDIRS)
$(SUBDIRS):
	$(MAKE) NEARLYC=$(NEARLEYC) -C $@

.PHONY: all $(SUBDIRS)

clean:
	find -name "*.js" -exec rm -fv "{}" \;
