import './my-app.tag';
import './my-type.tag';
import './my-sample-upload.tag';
import './my-primary.tag';
import './my-preview.tag';
import './my-choice.tag';
import './my-secondary.tag';
import './my-cm.tag';
import './my-property.tag'
import './my-group.tag'
import './my-rest.tag'
import './my-processor.tag'

<my-container>

  <img src = "../assets/logo.png" class = "logo o-image"></img>
 	<div class = "seperator"/>
    <div align = "center" class = "info">
      <h1>Feed Configuration Utility</h1>
    	<button onclick = {getJson} class="c-button" type="button">JSON</button>
    	<div class = "seperator"/>
  	</div>
  	<div id = "meta" if = {begin}></div>

    <div if = {!begin} >
      <div class="c-overlay"></div>
      <div class="o-modal">
        <div class="c-card">
          <header class="c-card__header" align = "center">
            <h2 class="c-heading">Hi!</h2>
          </header>
          <div class="c-card__body">
            This is odoscope's feed configuration utility. This utility will guide you throught the process of configuring the feeds for your shop.
            However to be configurable your feeds must meet thee following requirements:
            <ul>
              <li>Your Product Feeds and Category Feeds must be in seperate files.(Multiple files for both category and product feed are allowed)</li>
              <li>Your Products Feeds must contain a Primary ID</li>
              <li>Your Category feeds must be structured as simple tree with parent id's for each category and should also have root indicatrors</li>
            </ul>
            If your feeds do not meet any of these requirements please contact us for a custom configuration.
          </div>
          <footer class="c-card__footer" align = "center">
            <button type="button" class="c-button c-button--brand" onclick = {start}>Begin</button>
          </footer>
        </div>
      </div>
    </div>


  	<script>

  	var tag = this
    this.begin = false
  	
  	start()
    {
      this.begin = true
    	var container = document.createElement('div')
		  container.id = 'holder'
		  this.meta.appendChild(container)
    	riot.mount(container, 'my-app', {path: "begin", resolver: this.resolver, state:{start: true, configure: false}, data:{deflang: '', siteKeys: []}})
    }

    getJson()
    {
        console.log(JSON.stringify(tag.where.config, null, 4))
    }

    this.resolver = function(data, pathin, pathout)
    {
    	console.log(pathin+"->"+pathout)
    	var step = tag.where.analyze(data, pathin, pathout)
    	var container = document.createElement('div')
		  container.id = 'holder'
		  tag.meta.appendChild(container)
    	riot.mount(container, step.tag, {path: step.path, resolver: tag.resolver, state:step.state, data:step.data})
    }

   	</script>

</my-container>