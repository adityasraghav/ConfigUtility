<my-group>
	<rg-alerts></rg-alerts>
	<div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">Group Mapping</div>
	<div class="c-card__item">
		
		<div class="inps">
			
			<div class="elmts">
				<label class="grps" for="vc">Variant Column :</label>
			  	<select name = "vc"  onchange = {update} class="grps c-field"  > 
					<option selected></option>
					<option each={column in this.opts.data.header} value={column} class="grps" >{column}</option>
				</select>
			</div>
			<div class="elmts">
				<label class="c-toggle c-toggle--success grps" >
				Append Variant Properties To Parent
					<input type="checkbox" name = "ap" onchange = {update}></input>
					<div class="c-toggle__track" style = "display:inline-block; float:right">
	          			<div class="c-toggle__handle"></div>
	    			</div>
    			</label> 
			</div>
			<div class="elmts">
				<label class="c-toggle c-toggle--success grps" >
				Append Variant Properties To Parent
					<input type="checkbox" name = "up" onchange = {update} class="grps" ></input>
					<div class="c-toggle__track" style = "display:inline-block; float:right">
	          			<div class="c-toggle__handle"></div>
	    			</div>
    			</label> 

			</div>
			<div class="elmts">
				<label class="c-toggle c-toggle--success grps" >
				Splitter
					<input type="checkbox" name = "split" onchange = {update} class="grps" ></input>
					<div class="c-toggle__track" style = "display:inline-block; float:right">
	          			<div class="c-toggle__handle"></div>
	    			</div>
    			</label> 
				<input type="text" name = "splitter" maxlength="1" if= {split.checked} onkeyup = {update} class= "grps c-field " ></input>
			</div>
		</div>

		<br><br>
		
		<div if={vars.length > 0}>
			<div align="center">PREVIEW</h4></div>
			<div>
			    <label for="languageSelect">Languages</label>
			    <select name="languageSelect" class = "c-field" onchange={ update } style = "width: auto; display:inline-block;">
			        <option each={lang in this.opts.data.langs} value = {lang} }>{lang}</option>
			    </select>
			</div>
			    <br>
			<div class="o-grid  o-grid--wrap">
			    <div each = {node in vars} class="o-grid__cell o-grid__cell--width-30 " style="margin:1%;background-color: rgba(44, 62, 80, 0.16);word-wrap: break-word;">
			        <div>
			            Article ID = {node.id}
			        </div>
			        <div>
			        	Article Variant(s) = &nbsp;[
						<virtual each={var in node.varients}>
						"{var}",
						</virtual>
						]
			        </div>
			    </div>
			</div>
		</div>

		<br>
   			<div class = "seperator"/>
    	<br>
		
		<div align="center">
			<button name = "o" onclick = {back} class= "c-button c-button--success" type="button">done</button>
			<button onclick = {cancel} class= "c-button c-button--error" type="button">Cancel</button>
		</div>

	</div>
	</div>
	

	<script>

		this.on("mount", function()
        {   
            this.langs = this.opts.data.langs
		    this.header = this.opts.data.header
		    this.sample = this.opts.data.sample
		    this.ids = this.opts.data.ids
		    this.vc.value = this.opts.state.init.VariantsColumn
			this.ap.checked = this.opts.state.init.AppendVariantPropertiesToParent
			this.up.checked = this.opts.state.init.UseVariantsAsPropertySourceOnly
			if(this.opts.state.init.Splitter)
				this.splitter.value = this.opts.state.init.Splitter

		    this.update()

        })

		back()
		{
			if(this.vc.value)
			{
				this.opts.resolver({data: this.groupMappings, type : "groupMappings" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))
			}
			else
	        {
	        	riot.mount('rg-alerts', 
			    {
			      alerts:[{
			        type: "error",
			        text: "All fields are compulsary",
			        timeout: 3000
			        }]
			    });
			    return void 0
	        }
		    this.unmount()
		}

		this.on("update", function()
		{
			if(this.vc.value)
			{
				this.groupMappings = {}
				this.groupMappings.VariantsColumn = this.vc.value
				this.groupMappings.AppendVariantPropertiesToParent = this.ap.checked
				this.groupMappings.UseVariantsAsPropertySourceOnly = this.up.checked
				if(this.split.checked)
				{
					this.groupMappings.Splitter = this.splitter.value	
				}
				this.process()
			}
			
		})

		process()
		{
			if(this.vc.value)
			{
				var preview = new Map();
				var check = this.split.checked
				var lang = this.languageSelect.value
	
				for (var i = 0; i <this.sample.length ; i++) 
				{
					var varients = []
					if(check)
						varients =  this.sample[i][this.groupMappings.VariantsColumn].split(this.groupMappings.Splitter)
					else
						varients = [this.sample[i][this.groupMappings.VariantsColumn]]
					
					var TempId = preview.get(this.ids[i].id)
					
					if(!TempId)
					{
						preview.set(this.ids[i].id, varients)
					}
					else
					{
						preview.set(this.ids[i].id, TempId.concat(varients))
					}
				}
			}
			
			var tag = this
			this.vars = []
			preview.forEach(function(value, key) 
			{
				var temp = {}
 				temp.id = key
 				temp.varients = value
 				tag.vars.push(temp)
			})
			
		}

		cancel()
		{
			this.opts.resolver({data: this.opts.state.init.VariantsColumn?this.groupMappings:void 0, type : "groupMappings" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))
	        this.unmount()
		}

	</script>

</my-group>