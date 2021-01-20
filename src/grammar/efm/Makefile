SRCS = $(wildcard *.ne)
PROGS = $(patsubst %.ne,%.js,$(SRCS))

all: $(PROGS)

%.js: %.ne
	$(NEARLYC) $< > $@
