'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * jQloader  v0.1.0
 * @license  MIT
 * Designed  and built by Moer
 * Homepage  https://moerj.github.io/jQloader
 * GitHub    https://github.com/Moerj/jQloader
 */

(function ($) {
    'use strict';

    // 对一个 dom 建立jQloader的存储机制

    var JQloader = function JQloader(dom) {
        if (dom._jQloader === undefined) {
            dom._jQloader = new Map();
        }
        return {
            get: function get(key) {
                return dom._jQloader[key];
            },
            set: function set(key, val) {
                dom._jQloader[key] = val;
            },
            push: function push(key, val) {
                if (dom._jQloader[key] === undefined) {
                    dom._jQloader[key] = [];
                }
                dom._jQloader[key].push(val);
            }
        };
    };

    // 加载时页面顶部进度条

    var ProgressBar = function () {
        function ProgressBar() {
            _classCallCheck(this, ProgressBar);

            this.color = '#58a2d1';
            this.transition = '10s width';
            this.timer = null;
            this.$progress = $('<span></span>');
            this.reset();
            $('html').append(this.$progress);
        }

        _createClass(ProgressBar, [{
            key: 'reset',
            value: function reset() {
                this.$progress.css({
                    backgroundColor: this.color,
                    transition: 'none',
                    height: '2px',
                    width: 0,
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    zIndex: 9999,
                    boxShadow: '1px 1px 2px 0 ' + this.color
                });
            }
        }, {
            key: 'max',
            value: function max() {
                return document.body.clientWidth;
            }
        }, {
            key: 'setColor',
            value: function setColor(color) {
                if (typeof color === 'string') {
                    this.color = color;
                }
            }
        }, {
            key: 'start',
            value: function start() {
                this.reset();
                this.$progress.css({
                    width: this.max(),
                    transition: this.transition
                });
            }
        }, {
            key: 'stop',
            value: function stop() {
                this.$progress.css({
                    width: this.$progress.width()
                });
            }
        }, {
            key: 'finish',
            value: function finish() {
                var _this = this;

                this.stop();
                this.$progress.css({
                    width: this.max(),
                    transition: '0.5s width'
                });
                if (!this.timer) {
                    this.timer = setTimeout(function () {
                        _this.timer = null;
                        _this.reset();
                    }, 700);
                }
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.$progress.remove();
                this.$progress = null;
            }
        }]);

        return ProgressBar;
    }();

    // 编译当前页面 html 标签上的 loadPage 指令


    function _compile() {

        // 编译include
        var _compile_jqInclude = function _compile_jqInclude(dom) {
            var $dom = $(dom);
            var url = $dom.attr('src');
            if (url) {
                (function () {
                    var $container = $('<div></div>');
                    $dom.replaceWith($container);
                    $container.loadPage({
                        url: url,
                        history: false,
                        progress: false
                    }, function () {
                        // 编译并ajax加载完成后的回调
                        $container.children().eq(0).unwrap();
                    });
                })();
            }
        };
        var includeDoms = document.getElementsByTagName('jq-include');
        for (var i = 0; i < includeDoms.length; i++) {
            _compile_jqInclude(includeDoms[i]);
        }
    }

    // 拦截并重写 a 标签事件
    $('body').on('click', 'a', function (e) {
        var a = e.currentTarget;

        // load 类型
        var loadUrl = a.getAttribute('load');
        if (loadUrl) {
            e.preventDefault();
            var container = a.getAttribute('to');
            var $container = void 0;

            if (container) {
                $container = $(container);
            } else {
                $container = $('jq-router');
            }

            $container.loadPage({
                url: loadUrl,
                title: a.title
            });

            return false;
        }

        // 锚点类型
        var hash = a.hash;
        if (hash) {
            e.preventDefault();
            var id = hash.substr(1);
            // 用原生 js 获取 dom，因为jQuery $('')选择器获取中文的id会忽略空格。
            var $anchor = $(document.getElementById(id));
            // 滚动到锚点元素
            $('html, body').animate({
                scrollTop: $anchor.offset().top
            }, 300);
        }
    });

    // 载入历史记录
    function _loadHitory() {
        var historyData = history.state;
        var locationHash = document.location.hash.substr(1);

        if (historyData) {
            var url = historyData.url;
            var $container = void 0;

            // 指定读取历史页面的容器
            if (historyData.id) {
                $container = $('#' + historyData.id);
            } else {
                $container = $('jq-router');
            }

            if (!$container.length) {
                return;
            }

            $container.loadPage({
                url: url,
                history: false,
                progress: false,
                title: historyData.title
            });

            return;
        }

        if (locationHash) {
            var _$container = $('jq-router');

            if (!_$container.length) {
                return;
            }

            _$container.loadPage({
                url: locationHash,
                history: false,
                progress: true
            });

            return;
        }

        // 没有 url 参数，代表当前回到无路由页面
        // 因为用清空或者重请求等方法很难判断逻辑
        // 强制刷新一次，释放内存，也让它真正回到首页，用sessionStorage避免死循环刷新
        var needReload = sessionStorage.getItem('jqRouterReload');
        if (needReload) {
            sessionStorage.removeItem('jqRouterReload');
        } else {
            sessionStorage.setItem('jqRouterReload', true);
            window.location.replace(window.location.href);
        }
    }

    // 地址栏改变
    window.addEventListener("popstate", function () {
        _loadHitory();
    });

    // 暴露的公共方法 ==============================
    // loadPage 加载完后的回调组，用于指令触发load后的回调
    $.fn.loadFinish = function (call_back) {
        var container = $(this);
        JQloader(container[0]).push('loadPageCallBacks', call_back);
        return container;
    };

    // 加载一个页面
    $.fn.loadPage = function (OPTS, call_back) {
        var $container = $(this);

        if (!$container.length) {
            console.error($container.selector + ' not a vaild selector');
            return $container;
        }

        var DEFAULT = {
            history: true,
            progress: true,
            cache: true,
            async: true,
            title: null
        };

        OPTS = $.extend({}, DEFAULT, OPTS);

        // 开启 loading 进度条
        if (OPTS.progress) $.progressBar.start();

        // 请求页面
        $.ajax({
            dataType: 'html',
            url: OPTS.url,
            cache: OPTS.cache,
            async: OPTS.async,
            timeout: 10000,
            success: function success(data) {

                // 记录浏览器历史
                if (OPTS.history) {
                    // 处理 url 格式，浏览器地址栏去掉./开头
                    var url = OPTS.url;
                    if (OPTS.url.substring(0, 2) === './') {
                        url = OPTS.url.substring(2);
                    }

                    if ($container[0].localName === 'jq-router') {
                        // 浏览器地址栏操作
                        history.pushState({
                            title: OPTS.title,
                            url: OPTS.url
                        }, '', '#' + url);
                    } else {
                        var hashList = window.location.hash.split("#");
                        var routerUrl = hashList[1];
                        history.pushState({
                            title: OPTS.title,
                            id: $container.attr('id'),
                            url: OPTS.url
                        }, '', '#' + routerUrl + '#' + OPTS.url);
                    }
                }

                // 修改页面 title
                if (OPTS.title) {
                    window.document.title = OPTS.title;
                }

                // 写入页面
                $container.html(data);

                // 解决Zepto ajxa 请求到的页面 script 标签执行问题
                if (typeof Zepto != 'undefined' && typeof jQuery == 'undefined') {
                    var script = $container.find('script');
                    for (var _i = 0; _i < script.length; _i++) {
                        var src = script[_i].src;
                        if (src) {
                            // Zepto不会运行外联script
                            $.get(src);
                        } else {
                            // Zepto会执行两次页面的内联script
                            $(script[_i]).remove();
                        }
                    }
                }

                // 编译新页面上的指令
                _compile();

                // 运行容器上的回调方法组
                var callBacks = JQloader($container[0]).get('loadPageCallBacks');
                if (callBacks) {
                    for (var i = 0; i < callBacks.length; i++) {
                        callBacks[i]();
                    }
                }
            },
            error: function error() {
                console.warn('页面载入失败！');
            },
            complete: function complete() {
                // 进度条结束
                if (OPTS.progress) $.progressBar.finish();
                if (call_back) call_back();
            }
        });

        return $container;
    };

    // 创建进度条
    if (!$.progressBar) {
        $.progressBar = new ProgressBar();
    }

    $(function () {
        // jQloader所在页面/首页初始化 dom 完毕

        // 执行一次编译
        _compile();

        // 请求一次浏览器历史
        _loadHitory();
    });
})($);