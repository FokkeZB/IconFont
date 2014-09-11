# IconFont
 
CLI to convert CSS StyleSheets for Icon Fonts like [FontAwesome](https://github.com/FortAwesome/Font-Awesome/blob/master/css/font-awesome.css) to a [CommonJS module](test/font-awesome.js) that exports all unicodes by name. I use them in native iOS & Android apps build with [Titanium](http://appcelerator.com/titanium).

## Example

- Input: [font-awesome.css](test/font-awesome.css)
- Output: [font-awesome.js](test/font-awesome.js)

## Install the CLI [![npm](http://img.shields.io/npm/v/iconfont.png)](https://www.npmjs.org/package/iconfont)

Install the CLI via [NPM](https://www.npmjs.org/package/iconfont) like this:

	$ [sudo] npm install -g iconfont

## Generate a module

Just point the CLI to the CSS file:

	$ iconfont font-awesome.css

This would create a file named `font-awesome.js` in the same directory as the CSS file. If you want to write to a different path, simply pass it as the second argument:

	$ iconfont font-awesome.css ~/fa.js
	
## Use the module

In [Titanium](http://appcelerator.com/titanium), I'd use the module like this:

	var icons = require('font-awesome');
	
	var button = Ti.UI.createButton({
		font: {
			fontFamily: 'FontAwesome'
		},
		title: icons.flag
	});
	
In [Alloy](http://appcelerator.com/alloy) you can do:

*alloy.js*

	Alloy.Globals.icons = require('font-awesome');
	
*index.tss*

	"Button": {
		title: Alloy.Globals.icons.flag
	}
	
## Notes

- Icon names are camel-cased (`arrow-up` becomes `arrowUp`).
- If **all** icon names share the same prefix this will be stripped out (`icon-flag` becomes `flag`).
- The CLI expects selectors ending with `:before`.
- The CLI expects declerations with a `content` property and a valid unicode string as value.
	
## Issues

Please report issues and features requests in the repo's [issue tracker](https://github.com/fokkezb/IconFont/issues).

## License

Distributed under [MIT License](LICENSE).
