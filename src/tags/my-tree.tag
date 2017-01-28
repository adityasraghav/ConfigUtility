<my-tree>

	<div>
		<ul>
			<li each = {child in opts.children}>{child.lab}&nbsp;<button  if = {child.children.length > 0} onclick = {collapse} >&#9660;</button>
				<my-tree children = {child.children} if= {child.expand}><my-tree>
			</li>
		</ul>
	</div>
	<!-- <div class="c-card c-card--accordion u-high">
	<virtual each = {child in opts.children}>
		<input type="checkbox" id= {child.ID}>
			<label class="c-card__item" for={child.ID}>{child.lab}</label>
		<div if = {child.children.length > 0} class="c-card__item"><my-tree children = {child.children}></my-tree></div>
	</virtual>
	</div> -->


	collapse(e)
	{
		e.item.child.expand = !e.item.child.expand
	}

</my-tree>