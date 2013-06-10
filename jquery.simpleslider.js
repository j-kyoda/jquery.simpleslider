/*
 * jQuery simpleslider v0.1
 * http://makealone.jp/products/jquery.simpleslider
 *
 * Copyright 2013, makealone.jp
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
    $.fn.simpleslider = function(options) {
        var undefined;

        // options
        //
        // min -- min value
        // max -- max value
        // value -- initial value
        // orientation -- horizontal, vertical
        // box_class -- class for box
        // track_class -- class for track
        // handle_class -- class for handle
        // size -- [width, height]
        // change -- callback function for change
        //

        var defaults = {min: 0,
                        max: 100,
                        value: 0,
                        orientaion: HORIZONTAL,
                        box_class: '',
                        track_class: '',
                        handle_class: '',
                        size: [0, 0],
                        change: (function() {})
                       };
        // settings
        var box_width = 150;
        var box_height = 100;

        // environment
        var isTouchSupported = 'ontouchstart' in window;

        // define
        var VERTICAL = 'vertical';
        var HORIZONTAL = 'horizontal';

        // containes all method
        var methods = {
            create: function() {
                return this.each(function(i) {
                    var $this = $(this);

                    var opts = $.extend(defaults, options);

                    // values
                    var touch_x = -1;
                    var touch_y = -1;
                    var touch_x_init = -1;
                    var touch_y_init = -1;

                    var range = opts.max - opts.min;

                    // create dom
                    $this.addClass(opts.box_class);
                    var the_handle = $(document.createElement("div"));
                    the_handle.addClass(opts.handle_class);
                    var the_track = $(document.createElement("div"));
                    the_track.addClass(opts.track_class);
                    the_track.append(the_handle);
                    $this.append(the_track);

                    var box_width = $this.innerWidth();
                    var box_height = $this.innerHeight();
                    var handle_width = the_handle.outerWidth();
                    var handle_height = the_handle.outerHeight();
                    var track_width = the_track.width();
                    var track_height = the_track.height();

                    // calc track size position
                    if (opts.size[0] > 0 && opts.size[1] > 0) {
                        box_width = opts.size[0];
                        box_height = opts.size[1];
                        $this.width(box_width);
                        $this.height(box_height);

                        if (opts.orientation == VERTICAL) {
                            track_height = box_height - handle_height;
                            the_track.height(track_height);
                        } else {
                            track_width = box_width - handle_width;
                            the_track.width(track_width);
                        }
                        the_track.css('left', (($this.innerWidth() - the_track.outerWidth()) / 2) + 'px');
                        the_track.css('top', (($this.innerHeight() - the_track.outerHeight()) / 2) + 'px');
                    }

                    // functions
                    function clipval(val) {
                        return Math.max(Math.min(val, opts.max), opts.min);
                    };

                    function getval() {
                        return $this.data('as_value');
                    };

                    function setval(value) {
                        var cval = clipval(value);
                        if (cval != getval()) {
                            $this.data('as_value', cval);
                            opts.change(cval);
                        }
                    };

                    function draw_handle() {
                        var val = getval();
                        var top;
                        var left;
                        if (opts.orientation == VERTICAL) {
                            top =  (track_height / range * val) - (handle_height / 2);
                            left = (track_width / 2) - (handle_width / 2);
                        } else {
                            top =  (track_height / 2) - (handle_height / 2);
                            left = (track_width / range * val) - (handle_width / 2);
                        }
                        the_handle.css('top', top + 'px');
                        the_handle.css('left', left + 'px');
                    }

                    function move_handle(dx, dy) {
                        var value_init = getval();
                        var diff_var = 0;
                        //var offset = the_handle.offset();
                        if (opts.orientation == VERTICAL) {
                            diff_val = range / track_height * dy;
                        } else {
                            diff_val = range / track_width * dx;
                        }
                        setval(value_init + diff_val);
                        draw_handle();
                    };

                    function getPoint(e) {
                        if (e.type == 'touchmove' || e.type == 'touchstart') {
                            var touch = e.originalEvent.changedTouches[0];
                            return {'x': touch.clientX, 'y': touch.clientY};
                        }
                        if (e.type == 'mousedown' || e.type == 'mousemove') {
                            return {'x': e.pageX, 'y': e.pageY};
                        }
                        return {'x': -1, 'y': -1};
                    }

                    // Handle
                    function eventHandle(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        switch (e.type) {
                        case 'touchstart':
                        case 'mousedown':
                            if (touch_x >= 0) {
                                return;
                            }
                            (function() {
                                var point = getPoint(e);
                                touch_x = point['x'];
                                touch_y = point['y'];
                                touch_x_init = touch_x;
                                touch_y_init = touch_y;
                            })();
                            break;
                        case 'touchmove':
                        case 'mousemove':
                            if (touch_x < 0) {
                                return;
                            }
                            (function() {
                                var point = getPoint(e);
                                var dx = point['x'] - touch_x;
                                var dy = point['y'] - touch_y;
                                touch_x = point['x'];
                                touch_y = point['y'];
                                move_handle(dx, dy);
                            })();
                            break;
                        case 'touchend':
                        case 'mouseup':
                        case 'mouseout':
                            if (touch_x < 0) {
                                return;
                            }
                            (function (){
                                touch_x = -1;
                                touch_y = -1;
                            })();
                            break;
                        }

                    }

                    // init
                    setval(opts.value);
                    draw_handle();

                    var $window = $(window);
                    if (isTouchSupported) {
                        the_handle.bind('touchstart', eventHandle);
                        $window.bind('touchmove', eventHandle);
                        $window.bind('touchend', eventHandle);
                    } else {
                        the_handle.bind('mousedown', eventHandle);
                        $window.bind('mousemove', eventHandle);
                        //$window.bind('mouseout', eventHandle);
                        $window.bind('mouseup', eventHandle);
                    }
                });
            },
            get_val: function () {
                $(this).data('as_value');
            }
        };

        // do
        if (options == 'value') {
            return methods.get_val.apply(this);
        } else {
            return methods.create.apply(this);
        }
    };

})(jQuery);
