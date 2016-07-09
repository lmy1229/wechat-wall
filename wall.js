(function() {

	String.prototype.width = function(font) {  
	    var f = font || '12px arial',  
	    o = $('<div>' + this + '</div>')  
	        .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})  
	        .appendTo($('body')),  
	    w = o.width();  

	    o.remove();  
	    return w;  
	}

	loadImage = function(src, image) {
		image.src = '';
		var downloadImage = new Image();
		downloadImage.onload = function() {
			image.attr('src', this.src);
		}
		downloadImage.src = src;
	}

	Show = function(str, wthreshold) {
		size = $('.message-content').css("font-size");
		font = $('.message-content').css("font-family");
		if (str.width(size + ' ' + font) > wthreshold) {
			return false;
		} else {
			return true;
		}
		return true;
	}

	$(document).ready(function() {
		var adminInterval;
		var curindex = 0;
		var length = 3;
		var contentAtIndex = [];

		height = [];
		each = (window.innerHeight-100)/length;
		for (var i = 0; i < length; i++) {
			height[i] = 100 + i * each;
			contentAtIndex[i] = i;
		}
		left = (window.innerWidth - $('.message').width()) / 2;

		vm = new Vue({
			el: "#message-view",
			data : {
				showDatas: [{},{},{},{},{}],
				show0: true,
				show1: true,
				show2: true,
				show3: true,
				show4: true,
			},
		});

		$.get('https://wall.cgcgbcbc.com/api/messages?num='+length, function(json) {
			vm.showDatas = json;
			images = $('img');
			for (var i = 0; i < json.length; i++) {
				loadImage(json[i].headimgurl, images.eq(i));
				vm['show' + i] = Show(json[i].content, $('.message').width() - $('.message-headimg').width() - 20);
			}
		})

		$('.bulletin').css('-webkit-animation-duration','15s');

		c = $('.message');
		for (var i = 0; i < c.length; i++) {
			c.eq(i).css('top', height[i]);
			c.eq(i).css('left', left);
		}

		ws = io('https://wall.cgcgbcbc.com');
		ws.on("new message", function(data) {


			if (vm.showDatas.length < length) {
				vm.showDatas.push(data);
				vm['show' + (vm.showDatas.length - 1)] = Show(data.content,$('.message').width() - $('.message-headimg').width() - 20);
			} else {

				c = $('.message');

				if (adminInterval == undefined) {
					startPoint = 0;
				} else {
					startPoint = 1;
				}
				source = contentAtIndex[startPoint];
				c.eq(source)
					.animate({opacity: '0'}, 'fast', 'swing')
					.animate({top: height[length-1] + 'px'}, 'fast', 'linear', function(){
						if (!vm.showDatas[source]) {vm.showDatas[source] = {};}
						vm.showDatas[source].content = data.content.concat();
						vm.showDatas[source].nickname = data.nickname.concat();
						vm.showDatas[source].headimgurl = data.headimgurl.concat();
						loadImage(data.headimgurl, $('img').eq(source));
						vm['show' + source] = Show(data.content, $('.message').width() - $('.message-headimg').width() - 20);
						c.eq(source).css('background-color', '#2786e3');
					})
					.animate({opacity: '1'}, 'fast', 'swing');
				for (var i = startPoint + 1; i < length; i++) {
					j = contentAtIndex[i];
					c.eq(j).animate({top: height[i - 1] + 'px'}, 'fast');
					contentAtIndex[i-1] = j;
				}
				contentAtIndex[length-1] = source;

			}

		});
		ws.on("admin", function(data) {

			// data = data.reverse();

			if (adminInterval != undefined) {
				clearInterval(adminInterval);
			}
			adminInterval = setInterval(function() { clearInterval(adminInterval); adminInterval = undefined;}, 10000);

			$('.message').eq(contentAtIndex[0]).animate({opacity: 0}, 'fast', 'swing', function() {
					if (!vm.showDatas[contentAtIndex[0]]) {vm.showDatas[contentAtIndex[0]] = {}}
					vm.showDatas[contentAtIndex[0]].content = data.content.concat();
					vm.showDatas[contentAtIndex[0]].nickname = data.nickname.concat();
					vm.showDatas[contentAtIndex[0]].headimgurl = 'manager.svg';
					$('img').eq(contentAtIndex[0]).attr('src', 'manager.svg');
					vm['show' + contentAtIndex[0]] = Show(data.content,$('.message').width() - $('.message-headimg').width() - 20);
					$('.message').eq(contentAtIndex[0]).css('background-color', 'red');
				})
			  	.animate({opacity: 1}, 'fast', 'swing');
		})
	})
})();