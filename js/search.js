window.onload = function(){
    var app = new Vue({
        el: '#app',
        data: {
            loading: true,
            text: '',
            sug: null,
            page: 1,
            limit: 5,
            type: ["baidu","google","bing"],
            n_type: null,
            results: {
                baidu: [],
                google: [],
                bing: []
            }
        },
        mounted: function(){
            var scroll = {
                scrollbars: true,
                fadeScrollbars: true,
                mouseWheel: true,
                click: this.iScrollClick()
            };
            main_scroll = new IScroll("#app", scroll);
            this.text = this.getQueryString("query");
            this.page = this.getQueryString("page") || 1;
            this.search(this.getQueryString("query"));
        },
        updated: function(){
            main_scroll.refresh();
            if(!this.text) this.sug = false;
        },
        methods: {
            iScrollClick: function(){
                if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) return false;
                if (/Chrome/i.test(navigator.userAgent)) return (/Android/i.test(navigator.userAgent));
                if (/Silk/i.test(navigator.userAgent)) return false;
                if (/Android/i.test(navigator.userAgent)) {
                    var s=navigator.userAgent.substr(navigator.userAgent.indexOf('Android')+8,3);
                    return parseFloat(s[0]+s[3]) < 44 ? false : true
                }
            },
            ajax: function(obj){
                obj = obj || {};
                var xmlhttp, type, url, async, dataType, data;
                type = obj.type || 'GET';
                type = trim(type).toUpperCase();
                url = obj.url
                url = trim(url);
                async = obj.async || true;
                dataType = obj.dataType || 'HTML';
                dataType = trim(dataType).toUpperCase();
                data = obj.data || {};
                function trim(str) {
                    return str.replace(/^\s+|\s+$/g, "");
                };
                var formatParams = function() {
                    if (typeof(data) == "object") {
                        var str = "";
                        for (var pro in data) {
                            str += pro + "=" + data[pro] + "&";
                        }
                        data = str.substr(0, str.length - 1);
                    }
                    if (type == 'GET' || dataType == 'JSONP') {
                        if (url.lastIndexOf('?') == -1) {
                            url += '?' + data;
                        } else {
                            url += '&' + data;
                        }
                    }
                }
                if (window.XMLHttpRequest) {
                    xmlhttp = new XMLHttpRequest();
                } else {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
                if (dataType == 'JSONP') {
                    if (typeof(obj.beforeSend) == 'function') obj.beforeSend(xmlhttp);
                    var callbackName = ('jsonp_' + Math.random()).replace(".", "");
                    var oHead = document.getElementsByTagName('head')[0];
                    data.cb = callbackName;
                    var ele = document.createElement('script');
                    ele.type = "text/javascript";
                    oHead.appendChild(ele);
                    window[callbackName] = function(json) {
                        oHead.removeChild(ele);
                        window[callbackName] = null;
                        obj.success && obj.success(json);
                    };
                    formatParams();
                    ele.src = url;
                    return;
                }
            },
            get_sug: function(t){
                if(!t) return false;
                this.ajax({
                    url: 'https://unionsug.baidu.com/su?wd='+t,
                    type: 'get',
                    dataType: 'jsonp',
                    success: function(data){
                        if (JSON.stringify(data.s) !== '[]') {
                            app.sug = data.s || false;
                        } else {
                            app.sug = false;
                        };
                    }
                })
            },
            search: function(t){
                if(!t) return false;
                this.loading = true;
                this.n_type = 0;
                for (i=0; i<this.type.length; i++) {
                    this.ajax({
                        url: 'https://yooyle.avosapps.us/?keywords='+t+'&page='+this.page+'&limit='+this.limit+'&type='+this.type[i],
                        type: 'get',
                        dataType: 'jsonp',
                        success: function(data){
                            app.n_type += 1;
                            if(app.n_type == 1) {
                                app.results.baidu = data;
                            } else if(app.n_type === 2) {
                                app.results.google = data;
                            } else if(app.n_type === 3) {
                                app.results.bing = data;
                                app.loading = false;
                                document.title = app.text+' - Yooyle';
                                if (navigator.userAgent.toLowerCase().match(/MicroMessenger/i) !== "micromessenger") {
                                    history.pushState(null, null, '?query='+app.text+'&page='+app.page);
                                }
                            }
                        }
                    })
                }
            },
            getQueryString: function(name){ 
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return decodeURI(r[2]);
                return null;
            }
        }
    })
}