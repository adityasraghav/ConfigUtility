import './my-tree.tag';

<my-rest>
	<rg-alerts></rg-alerts>
	<div class="c-card u-highest" class="u-center-block" style = "width: 95%; height: 40%; margin: auto">
    <div class="c-card__item c-card__item--brand" align = "center">Category Feed Configuration</div>
    <div class="c-card__item">
    	<div class="inps" if = {!pre}>
			<div class= "elmts">
				<label class="grps" for="ttype">Categories Type: </label>
				<select name = "ttype" onchange = { update } class="grps c-field">
					<option value = "simple_tree">Simple Tree</option>
				</select>
			</div>

			<div class = "elmts">
				<label class="grps" for="langOpt">Same column for the labels of all Languages :</label>
			  	<select name = "langOpt" onchange = { update } class="grps c-field">
					<option value = 0>yes</option>
					<option value = 1>no</option>
				</select>
			</div>

	  		<div each= {lang in this.langs} if={ this.langOpt.value == 1 } class = "elmts" >
		  		<label class="grps" for="{lang}">{lang} :</label>
				<select name = "{lang}" onchange = { updatelangs } class="grps c-field">
					<option selected></option>
					<option each={column in this.header} value={column}>{column}</option>
				</select>
			</div>

			<div if={ this.langOpt.value == 0 } class = "elmts" >
			  	<label class="grps" for="column">Column for all labels :</label>
			  	<select name = "sameColumn" onchange = {update} class="grps c-field">
			  		<option selected></option>
					<option each={column in this.header} value={column}>{column}</option>
				</select>
			</div>

			<div class = "elmts">
				<label class="grps" for="id_column">ID Column :</label>
			  	<select name = "id_column" onchange = {update} class="grps c-field">
					<option selected></option>
					<option each={column in this.header} value={column}>{column}</option>
				</select>
			</div>
			
			<div class = "elmts">
				<label class="grps" for="pid_column">Parent ID column :</label>
				<select name = "pid_column" onchange = {update} class="c-field grps">
					<option selected value = -1></option>
					<option each={column in this.header} value={column}>{column}</option>
				</select>
			</div>

			<div class = "elmts">
				<label class="grps" for="root_column">Root Indicator Column :</label>
				<select name = "root_column" onchange = {update} class="c-field grps">
					<option selected value = -1></option>
					<option each={column in this.header} value={column}>{column}</option>
				</select>
			</div>

			<div class = "elmts">
				<label class="grps" for="root_value">Value of Root indicator: </label>
				<input type="text" name="root_value" maxlength="255" class="c-field grps">
			</div>
		</div>
		<div align= "center" if = {!pre} >
			<br>
   			<div class = "seperator"/>
    		<br>
			<button onclick={ preview } class="c-button c-button--info" style="width:auto" type="button"> Preview </button>
		</div>
		
		<div if = {pre}>
			<div name = "lang">
				<label class="block-label" for="languageSelect">Language</label>
		    	<select name="languageSelect" onchange={ preview }>
		    		<option each={lang in this.langs} value = {lang} }>{lang}</option>
		    	</select>
			</div>
			<div>
				<ol>
					<li each = {node in tree}>{node.lab} &nbsp;<button if = {node.children.length > 0} onclick = {collapse} >&#9660;</button>
						<my-tree children = {node.children} if = {node.expand}></my-tree>
					</li>
				</ol>

				<!-- <div class="c-card c-card"enter two dashes here"accordion u-high">

				<virtual each = {node in tree}>
				  <input type="checkbox" id= {node.ID}>
				  <label class="c-card__item" for={node.ID}>{node.lab}</label>
				  <div class="c-card__item"><my-tree children = {node.children}></my-tree></div>
				</virtual>

				</div> -->


			</div>
		</div>
		<div align= "center" if = {pre} >
			<br>
   			<div class = "seperator"/>
    		<br>
			<button onclick={ finish } class="c-button c-button--success" style="width:auto" type="button">Done</button>
			<button onclick={ reconfig } class="c-button c-button--error" style="width:auto" type="button">Reconfigure</button><br>
		</div>

	</div>
	</div>

	

	<script>

		this.on("mount", function() 
		{
			    this.langs = this.opts.data.langs
			    this.header = this.opts.data.header
			    this.values = {}
			    this.pre = false
			    this.update()

		})

		this.templang = {}

		reconfig()
		{
			this.pre = !this.pre
		}

		updatelangs(e)
		{
			this.templang[e.item.lang] = e.target.value
		}

		collapse(e)
		{
			e.item.node.expand = !e.item.node.expand
		}

		process()
		{

			if(!this.ttype.value || !this.id_column.value || !this.pid_column.value || !this.root_column.value || !this.root_value.value)
			{
				this.alerter("All fields are compulsary", "error")
				return void 0
			}

			var temp = {}
			temp.categoriesType = this.ttype.value
			temp.label = {}

			if(this.langOpt.value == 0)
		    {
				for(var i =0; i<this.langs.length; i++)
				{	
					if(!this.sameColumn.value)
					{
						this.alerter("Please select a column header", "error")
						return void 0
					}
					var tem = { }
					tem[this.langs[i]] = this.sameColumn.value;
					_.extend(temp.label, tem)
				}
		   	}
		    else if(this.langOpt.value == 1)
		    {
		    	for(var i =0; i<this.langs.length; i++)
		      	{
		      		if(!this.templang[this.langs[i]])
					{
						this.alerter("Please select a column header for "+this.langs[i], "error")
						return void 0
					}
		      		var tem = { };
		   			tem[this.langs[i]] = this.templang[this.langs[i]]
					_.extend(temp.label, tem)
		      	}
		    }
			temp.idColumn = this.id_column.value
			temp.parentIDColumn = this.pid_column.value
			temp.rooIndicator = { source: "column:"+this.root_column.value, equals: this.root_value.value }
			
			this.values = temp
			return true
		}

		treecreate(val)
		{
			this.tree = []
			this.sample = this.opts.data.SampleValues
			
			for(var i=0;i<this.sample.length;i++)
			{
				if(this.sample[i][this.root_column.value]==this.root_value.value)
				{
					var temp = {}
					temp.ID = this.sample[i][this.id_column.value]
					temp.lab = this.sample[i][this.values.label[val]]
					temp.children = []
					temp.expand = false
					this.tree.push(temp)
				}
			}

			for(var j=0;j<this.tree.length;j++)
			{
				this.tree[j].children = this.addchildren(this.tree[j].ID, val)
			}
		}

		this.addchildren = function(nodeid, val)
		{
			var result = []
			for(var i=0;i<this.sample.length;i++)
			{
				var temp = {}
				if(this.sample[i][this.pid_column.value]==nodeid)
				{
					temp.ID = this.sample[i][this.id_column.value]
					temp.children = this.addchildren(this.sample[i][this.id_column.value], val)
					temp.lab = this.sample[i][this.values.label[val]]
					temp.expand = false
					result.push(temp)
				}
			}
			return result
		}

		finish()
		{
			this.process()
			this.opts.resolver(this.values, this.opts.path, "begin")
	        this.unmount()
		}

		preview()
		{
			
			if(this.process())
			{
				this.pre = true
				this.treecreate(this.languageSelect.value)				
			}

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

</my-rest>