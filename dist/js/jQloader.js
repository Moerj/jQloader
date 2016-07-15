'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * jQloader  v0.1.4
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

    // 进度条

    var ProgressBar = function () {
        function ProgressBar() {
            _classCallCheck(this, ProgressBar);

            this.color = '#58a2d1';
            this.transition = '10s width';
            this.timer = null;
            this.$progress = $('<span class="jQloader-ProgressBar"></span>');
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
                var _this2 = this;

                this.stop();
                this.$progress.css({
                    width: this.max(),
                    transition: '0.5s width'
                });
                if (!this.timer) {
                    this.timer = setTimeout(function () {
                        _this2.timer = null;
                        _this2.reset();
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

    // 容器加载 loading 效果


    var LoadingLock = function () {
        function LoadingLock() {
            _classCallCheck(this, LoadingLock);

            this.$element = $('<div class="jQloader-loading"><div class="loadingBox">\
                                    <span class="loadingEffect fa fa-spin fa-spinner"></span>\
                                    <span class="loadingText"> loading...</span>\
                                </div></div>');
            this.$loadingEffect = this.$element.find('.loadingEffect');
            this.$loadingText = this.$element.find('.loadingText');
            this.$loadingBox = this.$element.find('.loadingBox');

            var $win = $(window);
            this.$element.css({
                width: $win.width(),
                height: $win.height(),
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'none'
            });
            this.$loadingBox.css({
                position: 'absolute',
                padding: '5px 15px',
                top: '50%',
                left: '50%',
                transform: 'translate3d(-50%,-50%,0)',
                background: 'rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                lineHeight: '80px',
                color: '#fff',
                fontSize: '16px'
            });

            $('html').append(this.$element);
        }

        _createClass(LoadingLock, [{
            key: 'lock',
            value: function lock() {
                this.$element.show();
            }
        }, {
            key: 'unlock',
            value: function unlock() {
                this.$element.hide();
            }
        }]);

        return LoadingLock;
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
    function _reWriteLinks() {
        $('body').on('click', 'a', function (e) {
            var a = e.currentTarget;

            // load 类型
            var loadUrl = a.getAttribute('load');
            if (loadUrl) {
                e.preventDefault();
                var container = a.getAttribute('to');
                var $container = void 0;
                var isStrict = false;

                if (container) {
                    $container = $(container);
                } else {
                    $container = $('jq-router');
                }

                // 是否严格模式
                if (a.getAttribute('strict') != null) {
                    isStrict = true;
                }

                $container.loadPage({
                    url: loadUrl,
                    title: a.title,
                    strict: isStrict
                });

                return;
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

                return;
            }
        });
    }

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
                progress: true,
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
            lock: false,
            cache: true,
            async: true,
            title: null,
            // strict: true, 开启严格模式，
            // 加载的 ajax 页面有 script 脚本时会强制重载当前页，
            // 用于清空页面所有ajax 残留 js，防止 js 重复绑定等问题
            strict: false
        };

        OPTS = $.extend({}, DEFAULT, OPTS);

        var _todo = function _todo(OPTS, data) {
            var _this = {
                strict: function strict() {
                    // 严格模式强制重载有 js 的 ajax 页面
                    if (OPTS.strict && data.indexOf('<script') >= 0) {
                        var host = window.location.host;
                        window.location.reload(host + '/#' + OPTS.url);
                    }
                    return _this;
                },
                history: function (_history) {
                    function history() {
                        return _history.apply(this, arguments);
                    }

                    history.toString = function () {
                        return _history.toString();
                    };

                    return history;
                }(function () {
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
                    return _this;
                }),
                title: function title() {
                    // 修改页面 title
                    if (OPTS.title) {
                        window.document.title = OPTS.title;
                    }
                    return _this;
                },
                render: function render() {
                    // 写入页面
                    $container.html(data);
                    return _this;
                },
                zepto: function zepto() {
                    // 解决Zepto ajxa 请求到的页面 script 标签执行问题
                    if (typeof Zepto != 'undefined' && typeof jQuery == 'undefined') {
                        var script = $container.find('script');
                        for (var i = 0; i < script.length; i++) {
                            var src = script[i].src;
                            if (src) {
                                // Zepto不会运行外联script
                                $.get(src);
                            } else {
                                // Zepto会执行两次页面的内联script
                                $(script[i]).remove();
                            }
                        }
                    }
                    return _this;
                },
                compile: function compile() {
                    // 编译新页面上的指令
                    _compile();
                    return _this;
                },
                callbacks: function callbacks() {
                    // 运行容器上的回调方法组
                    var callBacks = JQloader($container[0]).get('loadPageCallBacks');
                    if (callBacks) {
                        for (var i = 0; i < callBacks.length; i++) {
                            callBacks[i]();
                        }
                    }
                    return _this;
                }

            };
            return _this;
        };

        // 开启 loading 进度条
        if (OPTS.progress && !OPTS.strict) {
            $.progressBar.start();
        }

        // 开启 loading 锁定
        if (OPTS.lock) {
            $.loadingLock.lock();
        }

        // 请求页面
        $.ajax({
            dataType: 'html',
            url: OPTS.url,
            cache: OPTS.cache,
            async: OPTS.async,
            timeout: 10000,
            success: function success(data) {

                _todo(OPTS, data).strict().history().title().render().zepto().compile().callbacks();
            },
            error: function error() {
                console.warn('页面载入失败！');
            },
            complete: function complete() {
                // 进度条结束
                if (OPTS.progress && !OPTS.strict) {
                    $.progressBar.finish();
                }

                // 关闭锁定
                if (OPTS.lock) {
                    $.loadingLock.unlock();
                }

                // 本次 ajax 的回调
                if (call_back) call_back();
            }
        });

        return $container;
    };

    // 进度条实例
    if (!$.progressBar) {
        $.progressBar = new ProgressBar();
    }

    //  loading 实例
    if (!$.loadingLock) {
        $.loadingLock = new LoadingLock();
    }

    $(function () {
        // jQloader所在页面/首页初始化 dom 完毕

        // 重写 a 标签事件
        _reWriteLinks();

        // 执行一次编译
        _compile();

        // 请求一次浏览器历史
        _loadHitory();
    });
})($);