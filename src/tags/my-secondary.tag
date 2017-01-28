
<my-secondary>
	<rg-alerts></rg-alerts>
	<div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">Secondary Mapping</div>
	<div class="c-card__item">
		<button name = "new" class="c-button c-button--info" style="width:auto" type="button" onclick = { insert } if= {!this.insertion}>Create New</button>

		<div if= {!this.insertion}>
			<br>
			<div class="inps">
			<div class = "elmts" each={ map in secondaryMap }>
        		<label class = "grps">&nbsp;&#8226;&nbsp;{ map.ObjectName }&nbsp;&nbsp;</label>
        		<button onclick={ parent.removeMapping } class="c-button c-button--error grps" type="button" style="height:95%">Remove</button>
      		</div>
      		</div>
		</div>

		<div if= {!this.insertion && secondaryMap.length > 0}>
			<br>
		    <div align="center">PREVIEW</h4></div>
			<div>
			    <label for="languageSelect">Languages</label>
			    <select name="languageSelect" class = "c-field" onchange={ process } style = "width: auto; display:inline-block;">
			        <option each={lang in this.opts.data.langs} value = {lang} }>{lang}</option>
			    </select>
			</div>
			<div class="o-grid  o-grid--wrap">
			    <div each = {node in preview} class="o-grid__cell o-grid__cell--width-30 " style="margin:1%;background-color: rgba(44, 62, 80, 0.16);word-wrap: break-word;">
			        <div>
			            Article ID : {node.id}
			        </div>
			        <div>
						<virtual each={map in secondaryMap}>
						Article {map.ObjectName} : {isNaN(node[map.ObjectName])?"error":node[map.ObjectName]}
						<br>
						</virtual>
			        </div>
			    </div>
			</div>
		</div>

		<div align="center" if= {!this.insertion}>
			<br>
   			<div class = "seperator"/>
    		<br>
			<button name = "back" onclick = {done} class="c-button c-button--info" style="width:auto" type="button"> Done </button>
			<button onclick = {cancel} class= "c-button c-button--error" type="button">Cancel</button>
		</div>

		<div if= {this.insertion} class="inps">
			<form name = "sm">

				<div class = "elmts">
					<label class="grps" for="name">Object name: </label>
					<input type="text" name="name" maxlength="255" class="c-field grps">
				</div>
				<div class = "elmts">
					<label class="grps" for="valueType">Value Type: </label>
					<select name = "valueType" onchange = { update } class="c-field grps">
						<option selected></option>
						<option value = "float64"> Float 64 </option>
						<option value = "string"> String </option>
					</select>
				</div>
				
				<div class = "elmts">
					<label class="grps" for="langOpt">Same column for all Languages :</label>
				  	<select name = "langOpt" onchange = { update } class="c-field grps">
						<option value = 0>yes</option>
						<option value = 1>no</option>
					</select>
				</div>
				<div if={ this.langOpt.value == 0 } class="elmts">
			  		<label class="grps" for="column">Column :</label>
			  		<select name = "sameColumn" onchange = {update} class="c-field grps">
						<option selected></option>
						<option each={column in this.header} value={column}>{column}</option>
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
    	
			    <div class = "elmts">
			    	<label class="c-toggle c-toggle--success grps" >
					Regex:
					<input type="checkbox" name = "reg" onchange = {update}></input>
					<div class="c-toggle__track" style = "display:inline-block; float:right">
	          			<div class="c-toggle__handle"></div>
	    			</div>
    				</label> 
    				<input type="text" name = "regex" maxlength="50" if= {reg.checked} class="grps c-field"></input>
				</div>
				<div class = "elmts">
					<label class="c-toggle c-toggle--success grps" >
					Prefix:
					<input type="checkbox" name = "pre" onchange = {update}></input>
					<div class="c-toggle__track" style = "display:inline-block; float:right">
	          			<div class="c-toggle__handle"></div>
	    			</div>
    				</label> 
    				<input type="text" name = "prefix" maxlength="50" if= {pre.checked} class="grps c-field"></input>
				</div>
			</form>
		</div>
		
		<div align="center" if= {this.insertion}>
    		<br>
   			<div class = "seperator"/>
    		<br>
			<button  onclick={ addMapping } class="c-button c-button--info" style="width:auto" type="button">ADD</button>
			<button onclick = { reset } class= "c-button c-button--error" type="button">Cancel</button>
		</div>
		
	</div>
	</div>


	<script>

		this.insertion =  false
		var tag = this

		test(e)
		{
			console.log(e)
		}
	
		this.on("mount", function() 
		{
		    this.langs = this.opts.data.langs
		    this.header = this.opts.data.header
		    this.secondaryMap = this.opts.state.init
		    this.sample = this.opts.data.sample
		    this.ids = this.opts.data.ids

		    this.process()
		    this.update()
		})

		this.process = function()
		{
			this.preview = []
			var lang = this.languageSelect.value
			for (var i = 0; i < this.sample.length; i++) 
			{
				var temp = {}
				temp.id = this.ids[i].id
				for (var j = 0; j < this.secondaryMap.length; j++) 
				{
					if(this.secondaryMap[j].Regex || this.secondaryMap[j].Prefix)
	                {
		                if(this.secondaryMap[j].Regex)
		                {
		                    var reg = new RegExp(this.secondaryMap[j].Regex)
		                    temp[this.secondaryMap[j].ObjectName] = this.sample[i][this.secondaryMap[j].LanguageParameterNames[lang]].exec(reg)		                    		                    
		                }
		                if(this.secondaryMap[j].Prefix)
		                {                         
		                    var pre = this.secondaryMap[j].Prefix
		                    temp[this.secondaryMap[j].ObjectName] = pre + this.sample[i][this.secondaryMap[j].LanguageParameterNames[lang]]
		                }
	                }
	                else
	                    temp[this.secondaryMap[j].ObjectName] = this.sample[i][this.secondaryMap[j].LanguageParameterNames[lang]]

	                if(this.secondaryMap[j].ValueType === "float64")
	                {
	                	temp[this.secondaryMap[j].ObjectName] = parseFloat(this.sample[i][this.secondaryMap[j].LanguageParameterNames[lang]])
	                }
				}
				this.preview.push(temp)
			}
		}

		insert()
		{
			this.insertion = true;
		}

		done()
		{
			this.opts.resolver({data: this.secondaryMap, type : "secondaryMappings2" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))	
	        this.unmount()
		}

		cancel()
		{
			this.opts.resolver({data: this.opts.state.init.length>0?this.secondaryMap:void 0, type : "secondaryMappings2" }, this.opts.path, this.opts.path.slice(0, this.opts.path.lastIndexOf('/')))
	        this.unmount()
		}

		reset()
		{
			this.insertion = false
			this.sm.reset()
		}

		addMapping(e)
		{
			this.update()
			this.temp = {}
			if (this.name.value) 
		    {
		      	this.temp.ObjectName = this.name.value;
		      	if(this.valueType.value === 'other')
		      		this.temp.ValueType = this.othervalue.value
		      	else if(!this.valueType.value)
		      	{
		      		this.alerter("Please select value type", "error")
		      		return void 0
		      	}
		      	else
		      		this.temp.ValueType = this.valueType.value

		      	this.temp.LanguageParameterNames = {}
		      	
		      	if(this.langOpt.value == 0)
		      	{
		      		if(!this.sameColumn.value)
		      		{
		      			this.alerter("Please choose a column header", "error")
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

		      	if(this.reg.checked)
		      	{
		      		if(!this.regex.value)
		      		{
		      			this.alerter("Please enter Regex Value", "error")
		      			return void 0
		      		}
		      		this.temp.Regex = this.regex.value
		      	}
		      	if(this.pre.checked)
		      	{
		      		if(!this.prefix.value)
		      		{
		      			this.alerter("Please enter Prefix Value", "error")
		      			return void 0
		      		}
		      		this.temp.Prefix= this.prefix.value
		      	}	

		      	this.secondaryMap.push(this.temp)
		      	this.sm.reset()
		      	this.process()
		      	this.insertion = false
		      	this.update()
		    }
		    else
		    {
		    	this.alerter("Please enter object name", "error")
		    }
		}

		removeMapping(e)
	    {
		    	this.secondaryMap.splice(this.secondaryMap.indexOf(e.item), 1)
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

	</script>

</my-secondary>