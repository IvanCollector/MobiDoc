`
/*!
 * jQuery overflow plugin
 * help to know when element was overflowed
 * http://benalman.com/projects/jquery-resize-plugin/
 */

(function($,h,c){var a=$([]),e=$.resize=$.extend($.resize,{}),i,k="setTimeout",j="resize",d=j+"-special-event",b="delay",f="throttleWindow";e[b]=250;e[f]=true;$.event.special[j]={setup:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.add(l);$.data(this,d,{w:l.width(),h:l.height()});if(a.length===1){g()}},teardown:function(){if(!e[f]&&this[k]){return false}var l=$(this);a=a.not(l);l.removeData(d);if(!a.length){clearTimeout(i)}},add:function(l){if(!e[f]&&this[k]){return false}var n;function m(s,o,p){var q=$(this),r=$.data(this,d);r.w=o!==c?o:q.width();r.h=p!==c?p:q.height();n.apply(this,arguments)}if($.isFunction(l)){n=l;return m}else{n=l.handler;l.handler=m}}};function g(){i=h[k](function(){a.each(function(){var n=$(this),m=n.width(),l=n.height(),o=$.data(this,d);if(m!==o.w||l!==o.h){n.trigger(j,[o.w=m,o.h=l])}});g()},e[b])}})(jQuery,this);
`

`
/*!
 * Copyright (c) 2013 LegoMushroom Oleg Solomka
 * Dual licensed under the MIT and GPL licenses.
 * https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt
 */
`
do ->
	$::overflow = (o)->
		$el = @
		class Core 
			constructor:(o)->
				@o = o
				@overflowed = false
				@checkIfOF()
				@listenToResize()
				
			listenToResize:->
				$el.resize =>
					@checkIfOF()

			checkIfOF:->
				if @o?.axis?.toLowerCase() is 'y'
					$el.outerHeight()   < $el[0].scrollHeight   and @callOverflow()
					!($el.outerHeight() < $el[0].scrollHeight)  and @callRelease()
				if @o?.axis?.toLowerCase() is 'x'
					$el.outerWidth()   < $el[0].scrollWidth   and @callOverflow()
					!($el.outerWidth() < $el[0].scrollWidth)  and @callRelease()

				if !@o.axis?
					if ($el.outerHeight()< $el[0].scrollHeight) or ($el.outerWidth() < $el[0].scrollWidth) then @callOverflow()
					else @callRelease()



			callOverflow:->
				!@overflowed and @o.overflowCB?.call $el
				!@overflowed and $el.trigger 'overflow'
				@overflowed = true

			callRelease:->
				@overflowed and @o.releaseCB?.call $el
				@overflowed and $el.trigger 'flow'
				@overflowed = false

		new Core o

