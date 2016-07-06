/**
 * jQloader v0.0.1
 * @license: MIT
 * Designed and built by Moer
 * github   ...
 */

(($) => {
    'use strict';

    // 加载时页面顶部进度条
    class ProgressBar {
        constructor() {
            this.color = '#58a2d1';
            this.transition = '10s width';
            this.timer = null;
            this.$progress = $('<span></span>');
            this.reset();
            $('html').append(this.$progress);
        }
        reset() {
            this.$progress.css({
                backgroundColor: this.color,
                transition: 'none',
                height: '2px',
                width: 0,
                position: 'fixed',
                left: 0,
                top: 0,
                boxShadow: '1px 1px 2px 0 ' + this.color
            });
        }
        max() {
            return document.body.clientWidth
        }
        setColor(color) {
            if (typeof color === 'string') {
                this.color = color;
            }
        }
        start() {
            this.reset();
            this.$progress.css({
                width: this.max(),
                transition: this.transition
            });
        }
        stop() {
            this.$progress.css({
                width: this.$progress.width()
            });
        }
        finish() {
            this.stop();
            this.$progress.css({
                width: this.max(),
                transition: '0.5s width'
            });
            if (!this.timer) {
                this.timer = setTimeout(() => {
                    this.timer = null;
                    this.reset();
                }, 700)
            }
        }
        destroy() {
            this.$progress.remove();
            this.$progress = null;
        }
    }


    // 初始化 dom 对象下的命名空间，用于存放数据
    function _initNamespace(dom) {
        if (dom._jQloader === undefined) {
            dom._jQloader = {}; //dom 上存放jQloader数据的命名空间
        }
        if (dom._jQloader.loadFinishEvents === undefined) {
            dom._jQloader.loadFinishEvents = []
        }
        if (dom._jQloader.loadFinish === undefined) {
            dom._jQloader.loadFinish = () => {
                let events = dom._jQloader.loadFinishEvents;
                for (let i = 0; i < events.length; i++) {
                    events[i]();
                }
            }
        }
    }

    // 编译当前页面 html 标签上的 loadPage 指令
    function _compile() {
        let $loaders = $('jq-include');

        for (let i = 0; i < $loaders.length; i++) {
            let $loader = $($loaders[i]);
            let url = $loader.attr('src')
            let $container = $('<div></div>')
            $loader.replaceWith($container);
            $container.loadPage({
                url: url,
                history: false,
                progress: false
            }, () => {
                // 编译并ajax加载完成后的回调
                $container.children().eq(0).unwrap();
                _loadHitory();
            })
        }

    }

    // 载入历史记录
    function _loadHitory() {
        let domStr = history.state; //为 null 代表放回到最初历史
        let url = document.location.hash.substr(1);
        let $container;

        if (domStr) {
            $container = $(domStr)
        } else {
            $container = $($('jq-router')[0])
        }

        if (!$container.length) {
            return;
        }

        if (url) {
            $container.load(url);
        } else {
            $container.empty();
        }
    }

    // 浏览器历史跳转
    window.addEventListener("popstate", () => {
        _loadHitory()
    });


    // 暴露的公共方法 ==============================
    // loadPage 加载完后的回调
    $.fn.loadFinish = function(call_back) {
        let container = $(this);
        container[0]._jQloader.loadFinishEvents.push(call_back);
        return container
    }

    // 加载一个页面
    $.fn.loadPage = function(OPTS, call_back) {
        let container = $(this);

        if (!container.length) {
            console.error(container.selector + ' not a vaild selector');
            return container;
        }

        let DEFAULT = {
            history: true,
            progress: true,
            cache: true,
            async: true
        }

        OPTS = $.extend({}, DEFAULT, OPTS);

        // 初始化配置容器命名空间
        _initNamespace(container[0]);

        // 开启 loading 进度条
        if (OPTS.progress) $.progressBar.start();

        // 请求页面
        $.ajax({
            dataType: 'html',
            url: OPTS.url,
            cache: OPTS.cache,
            async: OPTS.async,
            timeout: 10000,
            success: (data) => {

                // 写入页面
                container.html(data);

                // 解决Zepto ajxa 请求到的页面 script 标签执行问题
                if (typeof Zepto != 'undefined' && typeof jQuery == 'undefined') {
                    let script = container.find('script');
                    for (let i = 0; i < script.length; i++) {
                        let src = script[i].src;
                        if (src) {
                            // Zepto不会运行外联script
                            $.get(src)
                        } else {
                            // Zepto会执行两次页面的内联script
                            $(script[i]).remove()
                        }
                    }
                }

                // 编译新页面上的指令
                _compile();

                // 运行容器上的回调方法组
                container[0]._jQloader.loadFinish();
            },
            error: () => {
                console.warn('页面载入失败！');
            },
            complete: () => {
                // 进度条结束
                if (OPTS.progress) $.progressBar.finish();
                if (call_back) call_back();
            }
        })

        // 浏览器历史记录
        if (OPTS.history) {
            // 处理 url 格式，浏览器地址栏去掉./开头
            let url = OPTS.url;
            if (OPTS.url.substring(0, 2) === './') {
                url = OPTS.url.substring(2)
            }

            // 改变浏览器地址栏
            if (container.localName === 'body') {
                history.pushState('body', '', '#' + url);
            } else {
                if (!container[0].id) {
                    container[0].id = 'router-' + Date.parse(new Date());
                }
                history.pushState('#' + container[0].id, '', '#' + url);
            }
        }

        return container;
    }

    // 创建进度条
    if (!$.progressBar) {
        $.progressBar = new ProgressBar();
    }


    $(() => {// jQloader所在页面/首页初始化 dom 完毕
        // 执行一次编译
        _compile();

        // 请求一次浏览器历史
        _loadHitory();
    })
})($)
