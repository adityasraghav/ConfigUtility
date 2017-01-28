<rg-modal>

	<div class="c-overlay { c-overlay--dismissable: opts.modal.dismissable }" if="{ opts.modal.isvisible }" onclick="{ close }"></div>
	<div class="o-modal { o-modal--ghost: opts.modal.ghost }" if="{ opts.modal.isvisible }">
		<header class="c-card__header" if = {opts.modal.heading}>
			<button if="{ opts.modal.dismissable }" type="button" class="c-button c-button--close" onclick="{ close }">
				&times;
			</button>
			<h3 class="c-heading c-heading--small">{ opts.modal.heading }</h3>
		</header>

		<div class="c-card__body" align = "center" name = "contents">
		</div>

		
		<footer class="c-card__footer c-card__footer--block">
			<div class="c-input-group">
			<button each="{ opts.modal.buttons }" type="button" class="c-button { 'c-button--' + type } c-button--block" onclick="{ action }" style="{ style }">
				{ text }
			</button>
			</div>
		</footer>
	</div>

	<script>
		this.on('mount', () => {
			if (!opts.modal) opts.modal = {}
			this.contents.innerHTML = opts.modal.contents
		})

		this.close = () => {
			if (opts.modal.dismissable) {
				opts.modal.isvisible = false
				this.trigger('close')
			}
		}

	</script>

	<style scoped>
		.o-modal--ghost .c-card__footer .c-button {
			margin: 0 .5em 0 0;
			display: block;
    		margin: auto;
		}
		/*.c-button
		{
			width: 25%;
		}*/

	</style>

</rg-modal>
