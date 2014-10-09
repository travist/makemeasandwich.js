me:
	@:
a:
	@:
sandwich:
ifeq ($(shell id -u), 0)
	@echo "Okay."
	makemeasandwich ${ARGS}
else
	@echo "What? Make it yourself."
endif
