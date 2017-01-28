<my-processor>
	<rg-alerts></rg-alerts>
	<div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">Post Processors</div>
	<div class="c-card__item">
		<div if= {!this.insertion}>
			<button name = "new" onclick = { insert } class="c-button c-button--info" style="width:auto" type="button" >Create New</button>
			<br><br>
			<div>
				<div class="inps">
					<div class = "elmts" each={ name in names}>
		        		<label class = "grps">&nbsp;&#8226;&nbsp;{ name }&nbsp;&nbsp;</label>
		        		<button onclick={ parent.removeMapping } class="c-button c-button--error grps" type="button" style="height:95%">Remove</button>
		      		</div>
      			</div>
			</div>
			
			<div align="center">
				<br>
	   			<div class = "seperator"/>
	    		<br>
				<button name = "back" onclick = {done} class="c-button c-button--info" style="width:auto" type="button"> Done </button>
				<br>
			</div>
		</div>
		
		<div  if= {this.insertion} class="inps">
			<div class="elmts">
				<label class="grps" for="name">Name: </label>
				<input type="text" name="name" maxlength="255" class="grps c-field">
			</div>
			<div class="elmts">
				<label class="grps" for="name">Type: </label>
				<select name = "type" onchange = { update } class="grps c-field">
					<option value = "additionalProductInformation">Aditional Product Information</option>
				</select>
			</div>

		</div>
		<div align="center" if = {insertion}>
			<br>
   			<div class = "seperator"/>
    		<br>
			<button name = "new" onclick = { process } class="c-button c-button--success" style="width:auto" type="button">Continue</button>
			<button name = "new" onclick = { insert } class="c-button c-button--error" style="width:auto" type="button">Cancel</button>
			<br>
		</div>
	</div>
	</div>

	<script>

	this.insertion =  false;
	
	this.on("mount", function() 
	{
	    this.langs = this.opts.data.langs
	    this.header = this.opts.data.header
	    this.processors = this.opts.state.init
	    this.names = this.opts.state.names
	    this.update()
	})

	insert()
	{
		this.insertion = !this.insertion
	}

	process()
	{
		if(!this.name.value || this.type.value)
		{
			riot.mount('rg-alerts', 
		    {
		      alerts:[{
		        type: "error",
		        text: "all value are required",
		        timeout: 3000
		        }]
		    });
		}
		this.names.push(this.name.value)
		this.opts.resolver({type: this.type.value, tempnames: this.names}, this.opts.path, this.opts.path+"/processor")
        this.unmount()
	}

	done()
    {
        this.opts.resolver({data: this.processors, type : "postProcessors" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))
        this.unmount()
    }

    removeMapping(e)
	{
		this.processors.splice(this.names.indexOf(e.item), 1)
		this.names.splice(this.names.indexOf(e.item), 1)
		this.update()
	}


	</script>

</my-processor>
