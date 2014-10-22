/* Version 1.0.0 */

(function() {
    // 刮刮乐
    function ScratchTicket(config) {
        config = $.extend({
            element: '#scratch_canvas', // 刮奖canvas元素或选择器
            img: '',                    // 刮奖区域图片, 可传图片地址或dom对象
            color: '#7d838b',           // 如无图片，可设置刮奖区域颜色
            fingerWidth: '30',          // 手指肥度
            threshold: 0.5              // 刮开面积到达此阈值时视为刮开。会在ele元素上触发scratchoff事件
        }, config);

        this.$ele = $(config.element);
        this.ele = this.$ele[0];
        this.config = config;

        var ctx = this.ele.getContext('2d');
        ctx.lineWidth = config.fingerWidth;
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.strokeStyle = 'black';
        this.ctx = ctx;

        this._eventEle = $({});

        this._init();
    }

    $.extend(ScratchTicket.prototype, {
        _init: function() {
            this._drawImage();
            this._bindEvents();
        },

        _drawImage: function() {
            var me = this,
                img = me.config.img,
                imgEle,
                width = me.ele.width;
                height = me.ele.height;

            me.ctx.globalCompositeOperation = "source-over";

            me.ctx.fillStyle = me.config.color;
            me.ctx.fillRect(0, 0, width, height);

            if(!img) {
                return;
            }

            // draw image
            if(typeof img === 'string') {
                imgEle = new Image();
                imgEle.crossOrigin = '*';
                imgEle.onload = function() {
                    me.ctx.drawImage(imgEle, 0, 0, width, height);
                    me._forceRepaint();
                }
                imgEle.src = img;
            }
            else {
                imgEle = img;
                me.ctx.drawImage(imgEle, 0, 0, width, height);
            }
            me._forceRepaint();
        },

        _bindEvents: function() {
            var me = this,
                $body = $('body');

            me.$ele.on('touchstart', function(e) {
                me.offset = me.$ele.offset();
                var coor = me._getCoors(e);
                me._scratchLine(coor.x, coor.y, true);

                $body.on('touchmove', move);
                $body.on('touchend', end);
                             
            });

            function move(e) {
                e.preventDefault();
                var coor = me._getCoors(e);
                me._scratchLine(coor.x, coor.y);
            }

            function end() {
                me.ctx.closePath();
                var ratio = me.getScratchRatio();
                if(ratio > me.config.threshold && !me.__scratched) {
                    me.trigger('scratchoff');
                    me.__scratched = true;
                }
                $body.off('touchmove', move);
                $body.off('touchend', end);
            }
        },

        _scratchLine: function(x, y, fresh) {
            if(fresh) {
                this.ctx.globalCompositeOperation = "destination-out";
                this.ctx.beginPath();
                this.ctx.moveTo(x+0.01, y);
            }
            this.ctx.lineTo(x, y);
            this.ctx.stroke();

            // destination-out合成模式在4.1.x手机下有bug，可能导致这时刻不渲染。
            // 因此需要通过改变css强制渲染
            this._forceRepaint();
        },

        _getCoors: function(ev) {
            var first, coords = {}, offset = this.offset;

            if (first = ev.changedTouches[0]) {
                coords.pageX = first.pageX;
                coords.pageY = first.pageY;
            } else {
                coords.pageX = ev.pageX;
                coords.pageY = ev.pageY;
            }
            
            return {
                'x': coords.pageX - offset.left,
                'y': coords.pageY - offset.top
            };
        },

        _forceRepaint: function() {
            (this.$ele.css('color') === 'red') ? this.$ele.css('color', 'black') : this.$ele.css('color', 'red');
        },

        getScratchRatio: function() {
            var pixels = this.ctx.getImageData(0, 0, this.ele.width, this.ele.height),
                pdata = pixels.data,
                stride = 4,
                total = pdata.length / 4,
                count = 0;

            for(var i = 0; i < pdata.length; i += stride) {
                if(pdata[i] != 0) {
                    count++;
                }
            }

            return 1 - count / total;
        },

        refresh: function() {
            this._drawImage();
            this.__scratched = false;
        },

        clear: function() {
            this.ctx.globalCompositeOperation = "destination-out";
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.ele.width, this.ele.height);
            this.__scratched = true;
            this._forceRepaint();
        },

        on: function() {
            this._eventEle.on.apply(this._eventEle, arguments);
        },

        off: function() {
            this._eventEle.off.apply(this._eventEle, arguments);
        },

        trigger: function() {
            this._eventEle.trigger.apply(this._eventEle, arguments);
        }
    });

    this.ScratchTicket = ScratchTicket;
})();
