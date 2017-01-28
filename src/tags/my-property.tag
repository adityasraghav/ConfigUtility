<my-property>
	<rg-alerts></rg-alerts>
	<div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">Property Group Mapping</div>
	<div class="c-card__item">

		<div if= {!this.insertion} >
			<button name = "new" onclick = { insert } class="c-button c-button--success" type="button">Create New</button>
			<br><br>
			<div class="inps">
			<div class = "elmts" each={ prop in this.propertyGroups2 } no-reorder>
        		<label class = "grps">&nbsp;&#8226;&nbsp;{ prop.Options[0].PropertyGroupID }&nbsp;&nbsp;</label>
        		<button onclick={ parent.removePropertyGroup  } class="c-button c-button--error grps" type="button" style="height:95%">Remove</button>
      		</div>
      		</div>

      		<br>
      		
      		<div if = {propertyGroups2.length>0}>
			    <div align="center">PREVIEW</h4></div>
				<div>
				    <label for="languageSelect">Languages</label>
				    <select name="languageSelect" class = "c-field" onchange={ update } style = "width: auto; display:inline-block;">
				        <option each={lang in this.opts.data.langs} value = {lang} }>{lang}</option>
				    </select>
				</div>
				<br>
				<div class="o-grid  o-grid--wrap" if={propertyGroups2.length>0}>
				    <div each = {node in sample} class="o-grid__cell o-grid__cell--width-30 " style="margin:1%;background-color: rgba(44, 62, 80, 0.16);word-wrap: break-word;">
				        <div>
				            Article ID = {node[ids[languageSelect.value]]}
				        </div>
				        <div>
							<virtual each={map in propertyGroups2}>
							Article {map.Options[0].Labels[languageSelect.value]} = {node[map.LanguageParameterNames[languageSelect.value]]}
							<br>
							</virtual>
				        </div>
				    </div>
				</div>
			</div>
			
			<div align="center">
			<br>
   			<div class = "seperator"/>
    		<br>
			<button onclick = {done} class="c-button c-button--success" style="width:auto" type="button"> Done </button>
			<button onclick = {cancel} class= "c-button c-button--error" type="button">Cancel</button>
			</div>	
		</div>

		<div if= {this.insertion}>
			<form name = "pm">
			<div class = "inps">

				<div class ="elmts">
					<label class="grps" for="name">Property Group ID: </label>
					<input type="text" name="name" maxlength="255" class="grps c-field">
				</div>
				<div class ="elmts">
					<label class="grps" for="valueType">Value Type: </label>
					<select name = "valueType" onchange = { update } class="grps c-field">
						<option selected></option>
						<option value = "float64"> Float 64 </option>
						<option value = "string"> String </option>
					</select>
				</div>
				<div class ="elmts">
					<label class="grps" for="langOpt">Same column for all Languages :</label>
			  		<select name = "langOpt" onchange = { update } class="grps c-field">
						<option value = 0>yes</option>
						<option value = 1 if = {this.langs.length > 1}>no</option>
					</select>
				</div>
				<div if={ this.langOpt.value == 0 } class ="elmts">
			  		<label class="grps" for="sameColumn">Column :</label>
			  		<select name = "sameColumn" onchange = {update} class="grps c-field">
						<option selected></option>
						<option each={column in this.header} value={column} no-reorder>{column}</option>
					</select>
				</div>

		  		<virtual each= {lang in this.langs} >
				  	<div if={ this.langOpt.value == 1 } class = "elmts" >
					  	<label class="grps" for="{lang}">{lang}:</label>
						<select id = "{lang}" onchange = {update} class="c-field grps">
							<option selected></option> 
							<option each={column in this.header} value={column}>{column}</option>
						</select>	
					</div>
				</virtual>

				<div class ="elmts">
					<label class="grps" for="lngOpt">Same label for all Languages :</label>
				  	<select name = "lngOpt" onchange = { update } class="grps c-field">
						<option value = 0>yes</option>
						<option value = 1 if = {this.langs.length > 1} >no</option>
					</select>
				</div>

			  	<virtual each= {lang in this.langs} >
				  	<div if={ this.lngOpt.value == 1 } class = "elmts" >
				  	<label class="grps" for="{lang+"_"}">{lang} Label:</label>
					<input id = "{lang+"_"}" type = "text" maxlength = "25"  onchange = { update } class="grps c-field">
					</input>
					</div>
				</virtual>


				<div if={ this.lngOpt.value == 0 } class ="elmts">
					<label class="grps" for="sameCol">Label :</label>
				  	<input name = "sameCol" type = "text" maxlength = "25"  onchange = { update } class="grps c-field">
					</input>
				</div>
				<div class="elmts">
					<label class="c-toggle c-toggle--success grps" >
					Splitter
						<input type="checkbox" name = "split" onchange = {update} class="grps" ></input>
						<div class="c-toggle__track" style = "display:inline-block; float:right">
		          			<div class="c-toggle__handle"></div>
		    			</div>
	    			</label> 
					<input type="text" name = "splitter" maxlength="1" if= {split.checked} onkeyup = {update} class= "grps c-field" ></input>
				</div>					
			</div>

				<br>
			</form>
			
			<div align="center">
				<br>
	   			<div class = "seperator"/>
	    		<br>
				<button onclick = {addPropertyGroup} class="c-button c-button--success" style="width:auto" type="button"> ADD </button>
				<button onclick = { reset } class= "c-button c-button--error" type="button">Cancel</button>
			</div>

		</div>


	</div>
	</div>

	<script>

		this.on("mount", function() 
		{
		    this.langs = this.opts.data.langs
		    this.header = this.opts.data.header
		    this.propertyGroups2 = this.opts.state.init
		    this.sample = this.opts.data.sample
		    this.ids = this.opts.data.ids
		    this.update()
		})

		this.insertion =  false

		insert()
		{
			this.insertion = true;
		}

		done()
		{
			this.opts.resolver({data: this.propertyGroups2, type : "propertyGroups2" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))
	        this.unmount()
		}

		mapChecker(value)
	    {
	    	for (var i = 0; i <this.propertyGroups2.length; i++) 
	    	{
	    		if(this.propertyGroups2[i].Options[0].PropertyGroupID === value)
	    			return false;
	    	}
	    	return true;
	    }

	    alerter(message, type)
	    {
				riot.mount('rg-alerts', 
			    {
			      alerts:[{
			        type: type,
			        text: message,
			        timeout: 3000
			        }]
			    });
	    }

		addPropertyGroup(e)
		{

			if (!this.name.value)
			{
				this.alerter("Please enter the Property Group ID", "error")
				return void 0
			}
			if (!this.valueType.value)
			{
				this.alerter("Please select the value type", "error")
				return void 0
			}
			
			
			this.temp = {}
			this.temp.Options = [{}]


    		this.temp.Options[0].PropertyGroupID = this.name.value;

      		this.temp.ValueType = this.valueType.value

      		this.temp.LanguageParameterNames = {}

	      	if(this.langOpt.value == 0)
	      	{
	      		if(!this.sameColumn.value)
	      		{
	      			this.alerter("Please select the column header", "error")
	      			return void 0
	      		}
				for(var i =0; i<this.langs.length; i++)
				{	
					var temp = { }
					temp[this.langs[i]] = this.sameColumn.value;
					_.extend(this.temp.LanguageParameterNames, temp)
				}
	      	}
	      	else if(this.langOpt.value == 1)
	      	{
	      		for(var i =0; i<this.langs.length; i++)
	      		{
	      			var thisLang = document.getElementById(this.langs[i])
	      			if(!thisLang.value)
	      			{
	      				this.alerter("Please choose a column header for "+this.langs[i], "error")
	      				return void 0
	      			}	
	      			
	      			var temp = { };
	      			temp[this.langs[i]] = thisLang.value;
					_.extend(this.temp.LanguageParameterNames, temp)
	      		}
	      	}

	      	if(this.split.checked)
	      	{
	      		if(!this.splitter.value)
	      		{
	      			this.alerter("Please select a value for or disable splitter", "error")
	      			return void 0
	      		}
	      		this.temp.Splitter = this.splitter.value
	      	}
     	      	
      		var labels = {}

	      	if(this.lngOpt.value == 0)
	      	{
	      		if(!this.sameCol.value)
	      		{
	      			this.alerter("Please enter a value for the label", "error")
	      			return void 0
	      		}
				for(var i =0; i<this.langs.length; i++)
				{	
					var tem = { }
					tem[this.langs[i]] = this.sameCol.value;
					_.extend(labels, tem)
				}
	      	}
	      	else if(this.lngOpt.value == 1)
	      	{    		
	      		for(var i =0; i<this.langs.length; i++)
	      		{
	      			var thisLangLab = document.getElementById(this.langs[i]+"_")
	      			if(!thisLangLab.value)
	      			{
	      				this.alerter("Please enter a label for "+this.langs[i], "error")
	      				return void 0
	      			}	
	      					      			
	      			var tem = { };
	      			tem[this.langs[i]] = thisLangLab.value;
					_.extend(labels, tem)
	      		}
	      	}
	      		
      		this.temp.Options[0].Labels = labels

      		this.propertyGroups2.push(this.temp)
      		this.pm.reset()
      		this.insertion = false
      		this.update()
		}

		removePropertyGroup(e)
	    {
	    	this.propertyGroups2.splice(this.propertyGroups2.indexOf(e.item), 1)
	    }

	    cancel()
		{
			this.opts.resolver({data: this.opts.state.init.length>0?this.propertyGroups2:void 0, type : "propertyGroups2" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))
	        this.unmount()
		}

		reset()
		{
			this.insertion = false
			this.pm.reset()
		}

	 </script>

</my-property>