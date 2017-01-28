<my-fields>

	<label class="c-toggle c-toggle--info" style = "width: 135px">
    	{opts.label.label}<div style="display:inline" if = {opts.label.label == 'ID'}>*</div>:    	
		<input type="checkbox" name = "expand" if = {opts.label.label != 'ID'} onchange = {update} ></input>
		<div class="c-toggle__track" if = {opts.label.label != 'ID'}  style = "margin-left:auto; margin-right:10px">
          <div class="c-toggle__handle"></div>
    	</div>
    </label> 
	
	</br>
	
	<div if = {opts.label.label == 'ID' || this.expand.checked } class = "inps">
	
		<div class = "elmts" style="display: none;">
			<label for="valueType" class = "grps">Type of Value : </label>
			<select name = "valueType" onchange = { update } class="c-field grps" >
				<option value = "float64" disabled = {opts.label.name!='price'} selected={opts.label.name=='price'}> Float 64 </option>
				<option value = "string" disabled = {opts.label.name =='price'} selected={opts.label.name!='price'}> String </option>
			</select>
		</div>
	
	  	<div class = "elmts">
	  	<label class="grps" for="langOpt">Same column <br> for all Languages :&nbsp;</label>
	  	<select name = "langOpt" onchange = { update } class="grps c-field">
			<option value = 0 selected >yes</option>
			<option value = 1 if = {langs.length > 1}>no</option>
		</select>
		</div>


		<div each= {lang in langs} no-roerder class = "elmts" if={ langOpt.value == 1 }>
			<label class="grps" for="{lang}">{lang} :</label>
			<select name = "{lang}" class="grps c-field" onchange = { updateDiffLangParameter }>
				<option selected></option>
				<option each={column in header} value={column} no-reorder>{column}</option>
			</select>
		</div>


		<div if={ langOpt.value == 0 } class = "elmts">
			<label class="grps" for="column">Column :</label>
			<select name = "sameColumn" class="grps c-field" onchange = {updateSameLangParameter}>
				<option selected></option>
				<option each={column in header} value={column} no-reorder>{column}</option>
			</select>
		</div>

		<div class = "elmts">
			<label class="c-toggle c-toggle--info grps" >
				Regex
				<input type="checkbox" name = "reg" onchange = {update}></input>
				<div class="c-toggle__track" style = "display:inline-block; float:right">
          			<div class="c-toggle__handle"></div>
    			</div>
    		</label> 
			<input type="text" name = "regex" maxlength="50" if= {reg.checked} class= "grps c-field " ></input>
		</div>

		<div class = "elmts">
			<label class="c-toggle c-toggle--info grps" >
				Prefix
				<input type="checkbox" name = "pre" onchange = {update}></input>
				<div class="c-toggle__track" style = "display:inline-block; float:right">
          			<div class="c-toggle__handle"></div>
    			</div>
    		</label> 
			<input type="text" name = "prefix" maxlength="50" if= {pre.checked} class ="grps c-field "></input>
		</div>
	</div>

<script>

	this.on("mount", function() 
	{
        this.langs = this.opts.langs
        this.header = this.opts.header
        this.update()
    })

	this.ValueType = void 0
	this.NumCols = [] 
	this.LanguageParameters = {};

	updateSameLangParameter()
	{
		this.sameColumn[0].disabled = true;
		this.LanguageParameters = {};
		for(var i =0; i<this.langs.length; i++)
		{	
			var temp = { }
			temp[this.langs[i]] = this.sameColumn.value;
			_.extend(this.LanguageParameters, temp)
		}
	}

	updateDiffLangParameter(e)
	{
		e.target[0].disabled = true;
		var temp = { };
		temp[e.item.lang] = e.target.value;
		_.extend(this.LanguageParameters, temp)
	}


	this.on("update", function()
	{
		if(opts.label.label == 'ID' || this.expand.checked)
		{
			this.mapped = {}			
			if(this.isMounted && this.valueType.value && (Object.keys(this.LanguageParameters).length === this.langs.length))
			{
		     	this.mapped["ValueType"] = this.valueType.value
		     	this.mapped["LanguageParameterNames"] = this.LanguageParameters
		      	if(this.pre.checked)
		     	{
		     		this.mapped["Prefix"] = this.prefix.value
		     	}
		     	if(this.reg.checked)
		     	{
		     		this.mapped["Regex"] = this.regex.value
		     	}
     		}
			this.opts.senddata(this.mapped, this.opts.label.name)
		}
		if(opts.label.label !== 'ID' && !this.expand.checked)
		{
			this.opts.senddata(void 0, this.opts.label.name)
		}
	 })

</script>


</my-fields>