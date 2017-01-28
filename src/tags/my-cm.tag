<my-cm>
	<rg-alerts></rg-alerts>
	<div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">Category Mapping</div>
	<div class="c-card__item">
		<div class ="inps">
			<div class ="elmts">
				<label class="grps" for="cc">Category Type :</label>
				<select name = "ct" onchange ={update} class="grps c-field " style = "display:inline-block; width:80%">
					<option selected></option>
					<option value = "url">Category URL</option>
					<option value = "discrete">Discrete Categories</option>
				</select>
			</div>

			<div class ="elmts">
			<label class="grps" for="cc">Category Column :</label>
		  	<select name = "cc" onchange ={update} class="grps c-field " style = "display:inline-block; width:80%">
				<option selected></option>
				<option each={column in this.opts.data.header} value={column}>{column}</option>
			</select>
			</div>
			<div class="elmts">
			<label class="grps" for="delimSelect">Delimiter:</label>
			<div class="grps">
			<select name="delimSelect" onchange={ update } class="c-field grps" style = "display:inline-block; width:80%">
				<option selected> </option>
			    <option value="-1">Custom</option>
			    <option value=";">;</option>
			    <option value=",">,</option>
			    <option value="\t">Tab</option>
			    <option value="|">|</option>
			    <option value=" ">Space</option>
			    <option value="/">/</option>
			</select>
			<input type="text" name="customDelim" maxlength="1" onkeyup={ update } if={ delimSelect.value =='-1' } class="c-field" style = "display:inline-block; width:18%; float:right">
			</div>
			</div>
		</div>
		
	<br><br>

	<div if={cats.length > 0}>
	<div align="center">PREVIEW</h4></div>
	<div>
        <label for="languageSelect">Languages</label>
        <select name="languageSelect" class = "c-field" onchange={ update } style = "width: auto; display:inline-block;">
            <option each={lang in this.opts.data.langs} value = {lang} }>{lang}</option>
        </select>
    </div>
        <br>
    <div class="o-grid  o-grid--wrap">
        <div each = {node in cats} class="o-grid__cell o-grid__cell--width-30 " style="margin:1%;background-color: rgba(44, 62, 80, 0.16);word-wrap: break-word;">
            <div>
                Article ID = {node.id}
            </div>
            <div>
            	Article Categories = &nbsp;
            	<virtual if = {this.ct.value=="discrete"}>
            		[
					<virtual each={cat in node.categories} >
					"{cat}",
					</virtual>
					]
				</virtual>
				<virtual if = {this.ct.value!="discrete"} each={cat in node.categories}>
					{cat}{delimSelect.value}
				</virtual>
            </div>
        </div>
    </div>
	</div>


	<br>
   		<div class = "seperator"/>
    <br>

	<div align= "center">
		<button onclick = {process} class= "c-button c-button--success" type="button">OK</button>
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
		    this.cc.value = this.opts.state.init.columnHeader
		    this.ct.value = this.opts.state.init.Type
		    this.delimSelect.value = this.opts.state.init.delimiter
		    this.update()

        })
		
		
		this.on("update", function()
		{
			if(this.cc.value && this.delimSelect.value && this.ct.value)
			{
				this.categoryMapping = {}
				this.categoryMapping.Type = this.ct.value
				this.categoryMapping.columnHeader = this.cc.value
				if(this.delimSelect.value!=-1)
					this.categoryMapping.delimiter = this.delimSelect.value
				else
					this.categoryMapping.delimiter = this.customDelim.value
				this.preview()
				
			}
		})

		preview()
		{
			this.cats = []
			var lang = this.languageSelect.value
			for (var i =0 ; i < this.sample.length; i++) 
			{
				var temp = {}
				temp.id = this.ids[i].id
				if(this.ct.value==="discrete")
					temp.categories =  this.sample[i][this.categoryMapping.columnHeader].split(this.categoryMapping.delimiter)
				else
					temp.categories = this.sample[i][this.categoryMapping.columnHeader].split(this.categoryMapping.delimiter)
				this.cats.push(temp)
			}
		}


		process()
		{
			if(this.cc.value && this.delimSelect.value && this.ct.value)
				this.opts.resolver({data: this.categoryMapping, type : "categoryMapping" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))
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

		cancel()
		{
			this.opts.resolver({data: this.opts.state.init.columnHeader?this.categoryMapping:void 0, type : "categoryMapping" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))
	        this.unmount()
		}

	</script>

</my-cm>