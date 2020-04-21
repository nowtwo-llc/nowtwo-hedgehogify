# HedgeHogify

We have a pretty interesting mix of characters that we use throughout our app. Our main character is Hedgie the hedgehog. We have created a lot of illustrations of hedgie over the years and want a fun way to share that with the world!

We created HedgehHogify to allow website developers and app creators to have Hegdie pop up all over the screen and add some joy to the world. This is a pretty lightweight library. The total size for this function is **~1.5k**.

Check out a [hedgehogify demo](https://classifylearning.github.io/hedgehogify.html)!

## Installing

Installation is pretty simple. Download the latest release and upload the CSS and JS files to your webserver. You will need to change the [PATH] variables to reflect where you uploaded the files.

```html
<script src="[JS_FILE_PATH]/hedgehogify.js"></script>
```

## Usage

We have a couple of ways to implement this within your app. The most common way would be to instantiate the object and pass in a configuration value. Check out the example below:

```javascript
window.onload = function() {
    let hedgehogify = new HedgeHogify();
    hedgehogify.burst();
};
```
The above example will run a burst of Hedgies on page load and will run for 10 seconds. After 10 seconds, all the Hedgies will disappear and your site/app will return to normal.

## Settings

Variable | Type | Description
--- | --- | ---
disableSteve | *boolean* | If set to true, Hedgie's friend Steve(the dog) will be removed from the images available to be selected. (**Default: false**)
disableMonsters | *boolean* | If set to true, the evil monsters who torment Hedgie will be removed from the images available to be selected. (**Default: false**)

## Events
Name | Description
--- | ---
he:hedgehogify:start | Fired when a timed burst run is started through an instantiated hedgehogify object.
he:hedgehogify:stop | Fired when a timed burst run is stopped through an instantiated hedgehogify object.

*Note - All events are fired/triggered on the document.*

## Authors

* **Classify Learning** - [classifylearning.com](https://classifylearning.com/)

## License

This project is licensed under the MIT License.

## Acknowledgments

* [The Cornify Project](https://www.cornify.com/)
* [Original Konami-JS Repo](https://github.com/snaptortoise/konami-js)