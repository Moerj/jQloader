/**
 * 1.1.1 = 1*100*100 + 1*100 + 1
 * 1.2.2 = 1*100*100 + 2*100 + 3
 *
 * 1 = 0*100 +1
 */
function encode_id_with_array(opts, arr) {
    var result = 0;
    for (var z = 0; z < arr.length; z++) {
        result += factor(opts, arr.length - z, arr[z]);
    }

    return result;
}


/**
 * 1.1.1 = 1*100*100 + 1*100 + 1
 * 1.2.2 = 1*100*100 + 2*100 + 3
 *
 * 1 = 0*100 +1

	1,1 = 100

 */
function get_parent_id_with_array(opts, arr) {
    var result_arr = [];

    for (var z = 0; z < arr.length; z++) {
        result_arr.push(arr[z]);
    }

    result_arr.pop();

    var result = 0;
    for (var z = 0; z < result_arr.length; z++) {
        result += factor(opts, result_arr.length - z, result_arr[z]);
    }

    return result;
}

function factor(opts, count, current) {
    if (1 == count) {
        return current;
    }

    var str = '';
    for (var i = count - 1; i > 0; i--) {
        str += current * opts.step + '*';
    }

    return eval(str + '1');
}

;
(function($) {
    /*
     * 根据header创建目录内容
     */
    function create_toc(opts) {
        $(opts.documment_selector).find(':header').each(function(index,el) {
			var exclude = opts.exclude;
			var isExclude = false;

			for (var i = 0; i < exclude.length; i++) {
				if (exclude[i] === el.localName) {
					return true;
				}
			}

			if (!isExclude) {

				var level = parseInt(this.nodeName.substring(1), 10);

				_rename_header_content(opts, this, level);

				_add_header_node(opts, $(this));
			}

        }); //end each
    }

    /*
     * 渲染ztree
     */
    function render_with_ztree(opts) {
        var t = $(opts._zTree);
        t = $.fn.zTree.init(t, opts.ztreeSetting, opts._header_nodes);

		if (opts.is_expand_all) {
			t.expandAll(opts.is_expand_all);
		}

        if (opts.is_posion_top == true) {
            opts.ztreeStyle.top = '0px';

            if (opts.ztreeStyle.hasOwnProperty('bottom'))
                delete opts.ztreeStyle.bottom;
        } else {
            opts.ztreeStyle.bottom = '0px';

            if (opts.ztreeStyle.hasOwnProperty('top'))
                delete opts.ztreeStyle.top;
        }

        $(opts._zTree).css(opts.ztreeStyle);
    }

    /*
     * 将已有header编号，并重命名
     */
    function _rename_header_content(opts, header_obj, level) {
        if (opts._headers.length == level) {
            opts._headers[level - 1]++;
        } else if (opts._headers.length > level) {
            opts._headers = opts._headers.slice(0, level);
            opts._headers[level - 1]++;
        } else if (opts._headers.length < level) {
            for (var i = 0; i < (level - opts._headers.length); i++) {
                // console.log('push 1');
                opts._headers.push(1);
            }
        }

        if (opts.is_auto_number == true) {
            //另存为的文件里会有编号，所以有编号的就不再重新替换
            if ($(header_obj).text().indexOf(opts._headers.join('.')) != -1) {

            } else {
                $(header_obj).text(opts._headers.join('.') + '. ' + $(header_obj).text());
            }
        }
    }

    /*
     * create table with head for anchor for example: <h2 id="#Linux基础">Linux基础</h2>
     * this method can get a headable anchor
     * add by https://github.com/chanble
     */
    function _get_anchor_from_head(header_obj) {
        var name = header_obj.html();
        var aname = name.split('.');
        var anchor = aname.pop().trim();
        return anchor;
    }

    /*
     * 给ztree用的header_nodes增加数据
     */
    function _add_header_node(opts, header_obj) {
        var id = encode_id_with_array(opts, opts._headers); //for ztree
        var pid = get_parent_id_with_array(opts, opts._headers); //for ztree
        var anchor = id; //use_head_anchor.html#第二部分

        // 默认使用标题作为anchor
        if (opts.use_head_anchor == true) {
            anchor = _get_anchor_from_head(header_obj);
        }

        // 设置锚点id
        $(header_obj).attr('id', anchor);

        log($(header_obj).text());

        // opts._header_offsets.push($(header_obj).offset().top - opts.highlight_offset);
        opts._header_offsets.push($(header_obj));

        log('h offset =' + ($(header_obj).offset().top - opts.highlight_offset));

        opts._header_nodes.push({
            id: id,
            pId: pid,
            name: $(header_obj).text() || 'null',
            open: true,
            url: '#' + anchor,
            target: '_self'
        });
    }

    /*
     * 根据滚动确定当前位置，并更新ztree
     */
    function bind_scroll_event_and_update_postion(opts) {
        var timeout;
		var treeList = opts._zTree.find('a');

        var highlight_on_scroll = function() {
			if (!opts._zTree[0].clientHeight) {
				// 防止 ajax 刷新页面，多次绑定 scroll event
				$(opts.scroll_selector).off('scroll');
				return;
			}
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function() {
				var treeObj = $.fn.zTree.getZTreeObj(opts._zTree.attr('id'));
				var needExpandNode;
				var otherNode = treeObj.getNodes()[0].children;

                for (var i = 0; i < opts._header_offsets.length; i++) {
                    var h = $(opts._header_offsets[i]);
					if (!($(window).scrollTop()>h.offset().top)) {
                        // tree list set
						treeList.removeClass('curSelectedNode');
						treeList.eq(i).addClass('curSelectedNode');
						var tid = treeList.eq(i).parent().attr('id');
						needExpandNode = treeObj.getNodeByTId(tid);

						break;
					}
                }

				for (var j = 0; j < otherNode.length; j++) {
					treeObj.expandNode(otherNode[j], false);
				}

				treeObj.expandNode(needExpandNode, true);
				treeObj.expandNode(needExpandNode.getParentNode(), true);

            }, opts.refresh_scroll_time);
        };

        if (opts.highlight_on_scroll) {
            $(opts.scroll_selector).on('scroll', highlight_on_scroll);
            highlight_on_scroll();
        }
    }

    /*
     * 初始化
     */
    function init_with_config(opts) {
        opts.highlight_offset = $(opts.documment_selector).offset().top;
    }

    /*
     * 日志
     */
    function log(str) {
        if ($.fn.ztree_toc.defaults.debug == true) {
            console.log(str);
        }
    }

    $.fn.ztree_toc = function(options) {
        // 将defaults 和 options 参数合并到{}
        var opts = $.extend({}, $.fn.ztree_toc.defaults, options);

        return this.each(function() {
            opts._zTree = $(this);

            // 初始化
            init_with_config(opts);

            // 创建table of content，获取元数据_headers
            create_toc(opts);

            // 根据_headers生成ztree
            render_with_ztree(opts);

            // 根据滚动确定当前位置，并更新ztree
            bind_scroll_event_and_update_postion(opts);
        });
        // each end
    }

    //定义默认
    $.fn.ztree_toc.defaults = {
        _zTree: this,
        _headers: [],
        _header_offsets: [],
        _header_nodes: [],
        debug: false,
        /*
         * 使用标题作为anchor
         * create table with head for anchor for example: <h2 id="#Linux基础">Linux基础</h2>
         * 如果标题是唯一的，建议开启此选项，如果标题不唯一，还是使用数字吧
         * 此选项默认是false，不开启
         */
		exclude:[],
        use_head_anchor: false,
        scroll_selector: window,
        highlight_offset: 0,
        highlight_on_scroll: true,
        /*
         * 计算滚动判断当前位置的时间，默认是50毫秒
         */
        refresh_scroll_time: 50,
        documment_selector: 'body',
        /*
         * ztree的位置，默认是在上部
         */
        is_posion_top: true,
        /*
         * 默认是否显示header编号
         */
        is_auto_number: false,
        /*
         * 默认是否展开全部
         */
        is_expand_all: false,
        /*
         * 是否对选中行，显示高亮效果
         */
        is_highlight_selected_line: true,
        step: 100,
        ztreeStyle: {
            width: '260px',
            overflow: 'auto',
            position: 'fixed',
            'z-index': 1,
            border: '0px none'
        },
        ztreeSetting: {
            view: {
                dblClickExpand: false,
                showLine: true,
                showIcon: false,
                selectedMulti: false,
				expandSpeed: ""
            },
            data: {
                simpleData: {
                    enable: true,
                    idKey: "id",
                    pIdKey: "pId",
                    // rootPId: "0"
                }
            },
            callback: {
                beforeClick: function(treeId, treeNode) {
					if (treeNode.isParent) {
						var treeObj = $.fn.zTree.getZTreeObj(treeId);
						treeObj.expandNode(treeNode, true, true, true);
					}
                    // 点击 tree ，内容标题高亮一次
                    if ($.fn.ztree_toc.defaults.is_highlight_selected_line == true) {
                        var $hTag = $(document.getElementById(treeNode.url.substr(1)))
                        var color = $hTag.css('color')
                        $hTag.css('color', '#4786c9').fadeOut("slow", function() {
                            // Animation complete.
                            $(this).show().css('color', color);
                        });
                    }
                },
                onRightClick: function(event, treeId, treeNode) {
                },
				onNodeCreated: function (event, treeId, treeNode) {
					var treeObj = $.fn.zTree.getZTreeObj(treeId);
				    if (treeNode.level == 1) {
						treeObj.expandNode(treeNode,false,false,false);
				    }
				}
            }
        }
    };

})(jQuery);
