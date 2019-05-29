var penCutout = function () {

    this.defaults = {
        drawPanel: "drawPanel",
        canvasId: "canvas",
        imgId: "imgCut",
        width: 400,
        height: 400,
        imgSrc: "file/target.jpg",
        imgBackSrc: "file/tranback.png",
        penColor: "#0087C4",
        defaultPointList: new Array(),
        showTip: function (msg) {
            alert(msg);
        }
    };
    this.init = function (options) {
        if (this.notEmptyObj(options)) {
            this.defaults = $.extend(this.defaults, options);
        }
        this.initElement();
        this.iniData()
        this.eventBind();
    }
    this.initElement = function () {
        $("#drawPanel").append('<img id="' + this.defaults.imgId + '"/><canvas id="' + this.defaults.canvasId + '"/>')
    }
    this.eventBind = function () {
        //初始化事件：
        var a = this;
        $("#" + a.can.id).mousemove(function (e) {
            var p = a.can.pointList;
            if (a.can.paint) {//是不是按下了鼠标
                if (p.length > 0) {
                    a.equalStartPoint(p[p.length - 1].pointx, p[p.length - 1].pointy);
                }
                a.roundIn(e.offsetX, e.offsetY);
            }
            //判断是否在直线上
            //光标移动到线的附近如果是闭合的需要重新划线，并画上新添加的点
            a.AddNewNode(e.offsetX, e.offsetY);
            //添加动态线：
            a.draAllMove(e.offsetX, e.offsetY);
        });
        $("#" + a.can.id).mousedown(function (e) {
            var p = a.can.pointList;
            a.can.paint = true;
            //点击判断是否需要在线上插入新的节点：
            if (a.can.tempPointList.length > 0) {
                a.can.pointList.splice(a.can.tempPointList[1].pointx, 0, new a.point(a.can.tempPointList[0].pointx, a.can.tempPointList[0].pointy));
                //
                //清空临时数组
                a.can.tempPointList.length = 0;
            }
        });
        $("#" + a.can.id).mouseup(function (e) {
            var p = a.can.pointList;
            //拖动结束
            a.can.paint = false;
            //拖动结束；
            if (a.can.juPull) {
                a.can.juPull = false;
                a.can.curPointIndex = 0;
                //验证抠图是否闭合：闭合，让结束点=开始点；添加标记
                a.equalStartPoint(p[p.length - 1].pointx, p[p.length - 1].pointy);
            } else {
                //如果闭合：禁止添加新的点；
                if (!a.can.IsClose) {//没有闭合
                    p.push(new a.point(e.offsetX, e.offsetY));
                    //验证抠图是否闭合：闭合，让结束点=开始点；添加标记
                    a.equalStartPoint(p[p.length - 1].pointx, p[p.length - 1].pointy);
                    //判断是否闭合：
                    //重新画；
                    if (p.length > 1) {
                        a.drawLine(p[p.length - 2].pointx, p[p.length - 2].pointy, p[p.length - 1].pointx, p[p.length - 1].pointy);
                        a.drawArc(p[p.length - 1].pointx, p[p.length - 1].pointy);
                    } else {
                        a.drawArc(p[p.length - 1].pointx, p[p.length - 1].pointy);
                    }
                } else {
                    //闭合
                }
            }
            //验证是否填充背景：
            if (a.can.IsClose) {
                a.fillBackColor();
                a.drawAllLine();
            }
        });
        $("#" + a.can.id).mouseleave(function (e) {
            a.can.paint = false;
        });
    }
    this.iniData = function (options) {
        if (this.notEmptyObj(options)) {
            this.defaults = $.extend(this.defaults, options);
        }
        this.can.id = this.defaults.canvasId;
        this.can.roundr = 7;
        this.can.roundrr = 3;
        this.can.imgBack.src = this.defaults.imgBackSrc;
        this.can.penColor = this.defaults.penColor;
        this.can.canvas = document.getElementById(this.can.id).getContext("2d");
        this.can.w = this.defaults.width;
        this.can.h = this.defaults.height;
        $("#" + this.defaults.drawPanel + ",#" + this.can.id + ",#" + this.defaults.imgId).attr({
            "width": this.defaults.width,
            "height": this.defaults.height
        }).css({
            "position": "absolute",
            "width": this.defaults.width,
            "height": this.defaults.height
        });
        $("#" + this.defaults.drawPanel).css("z-index", 0);
        $("#" + this.defaults.imgId).css("z-index", 1);
        $("#" + this.can.id).css("z-index", 2);
        this.can.curPointIndex = 0;
        //图片
        this.img.w = this.can.w;
        this.img.h = this.can.h;
        this.img.image.src = this.defaults.imgSrc;
        $("#" + this.defaults.imgId).attr({"src": this.img.image.src})
        //加载事件：
        this.ReDo();
        if (this.notEmptyObj(this.defaults.defaultPointList) && this.defaults.defaultPointList.length > 0) {
            this.setOriPoints(this.defaults.defaultPointList);
        }
    }
    this.point = function (x, y) {
        this.pointx = x;
        this.pointy = y;
    }
    //设置初始坐标点
    this.setOriPoints = function (pointObj) {
        this.clearCan();
        if (pointObj != null && pointObj.length > 0) {
            this.can.pointList = pointObj.concat();
            if (pointObj.length > 1 && pointObj[pointObj.length - 1].pointx == pointObj[0].pointx) {
                this.can.IsClose = true;
                this.fillBackColor();
            } else {
                this.drawAllLine();
            }
        }
    }
    //图片
    this.img = {
        image: new Image(),
        id: "",
        w: 0,
        h: 0
    }
    //画布；
    this.can = {
        canvas: new Object(),
        id: "",
        w: 0,
        h: 0,
        //坐标点集合
        pointList: new Array(),
        //临时存储坐标点
        tempPointList: new Array(),
        //圆点的触发半径：
        roundr: 7,
        //圆点的显示半径：
        roundrr: 7,
        //当前拖动点的索引值；
        curPointIndex: 0,
        //判断是否点击拖动
        paint: false,
        //判断是否点圆点拖动，并瞬间离开,是否拖动点；
        juPull: false,
        //判断是否闭合
        IsClose: false,
        imgBack: new Image(),
        penColor: "#0087C4"
    }
    //函数：重做，清空
    this.ReDo = function () {
        this.clearCan();
        //清空listPoint();
        this.can.pointList.length = 0;
        //IsClose闭合重新设为false;
        this.can.IsClose = false;
    }
    //保存：返回所有点的数组：
    this.SaveCut = function () {
        return this.can.pointList();
    }
    //更新画线
    this.drawAllLine = function () {
        for (var i = 0; i < this.can.pointList.length - 1; i++) {
            //画线
            var p = this.can.pointList;
            this.drawLine(p[i].pointx, p[i].pointy, p[i + 1].pointx, p[i + 1].pointy);
            //画圈
            this.drawArc(p[i].pointx, p[i].pointy);
            if (i == this.can.pointList.length - 2) {
                this.drawArc(p[i + 1].pointx, p[i + 1].pointy);
            }
        }
    }
    //动态线针：(光标的x,y)
    this.draAllMove = function (x, y) {
        if (!this.can.IsClose) {
            if (this.can.pointList.length >= 1) {
                //重画：
                this.clearCan();
                var p = this.can.pointList;
                for (var i = 0; i < this.can.pointList.length - 1; i++) {
                    //画线
                    this.drawLine(p[i].pointx, p[i].pointy, p[i + 1].pointx, p[i + 1].pointy);
                    ////画圈
                    this.drawArc(p[i].pointx, p[i].pointy);
                    if (i == this.can.pointList.length - 2) {
                        this.drawArc(p[i + 1].pointx, p[i + 1].pointy);
                    }
                }
                if (p.length == 1) {
                    this.drawArc(p[0].pointx, p[0].pointy);
                }
                this.drawArcSmall(x, y);
                this.drawLine(p[this.can.pointList.length - 1].pointx, p[this.can.pointList.length - 1].pointy, x, y);

            }
        }
    }
    //画线
    this.drawLine = function (startX, startY, endX, endY) {
        //var grd = this.can.canvas.createLinearGradient(0, 0,2,0); //坐标，长宽
        //grd.addColorStop(0, "black"); //起点颜色
        //grd.addColorStop(1, "white");
        //this.can.canvas.strokeStyle = grd;
        this.can.canvas.strokeStyle = this.can.penColor;
        this.can.canvas.lineWidth = 1;
        this.can.canvas.moveTo(startX, startY);
        this.can.canvas.lineTo(endX, endY);
        this.can.canvas.stroke();
    }
    //画圈：
    this.drawArc = function (x, y) {
        this.can.canvas.fillStyle = this.can.penColor;
        this.can.canvas.beginPath();
        this.can.canvas.arc(x, y, this.can.roundrr, 360, Math.PI * 2, true);
        this.can.canvas.closePath();
        this.can.canvas.fill();
    }
    //画圈：
    this.drawArcSmall = function (x, y) {
        this.can.canvas.fillStyle = this.can.penColor;
        this.can.canvas.beginPath();
        this.can.canvas.arc(x, y, 0.1, 360, Math.PI * 2, true);
        this.can.canvas.closePath();
        this.can.canvas.fill();
    }
    //光标移到线上画大圈：
    this.drawArcBig = function (x, y) {
        this.can.canvas.fillStyle = this.can.penColor;
        this.can.canvas.beginPath();
        this.can.canvas.arc(x, y, this.can.roundr + 2, 360, Math.PI * 2, true);
        this.can.canvas.closePath();
        this.can.canvas.fill();
    }
    //渲染图片往画布上
    this.showImg = function () {
        this.img.image.onload = function () {
            this.can.canvas.drawImage(this.img.image, 0, 0, this.img.w, this.img.h);
        };
    }
    //填充背景色
    this.fillBackColor = function () {
        for (var i = 0; i < this.img.w; i += 96) {
            for (var j = 0; j <= this.img.h; j += 96) {
                this.can.canvas.drawImage(this.can.imgBack, i, j, 96, 96);
            }
        }
        this.can.canvas.globalCompositeOperation = "destination-out";
        this.can.canvas.beginPath();
        for (var i = 0; i < this.can.pointList.length; i++) {
            this.can.canvas.lineTo(this.can.pointList[i].pointx, this.can.pointList[i].pointy);
        }
        this.can.canvas.closePath();
        this.can.canvas.fill();
        this.can.canvas.globalCompositeOperation = "destination-over";
        this.drawAllLine();
    }
    //去掉pointlist最后一个坐标点：
    this.clearLastPoint = function () {
        this.can.pointList.pop();
        //重画：
        this.clearCan();
        this.drawAllLine();
    }
    //判断结束点是否与起始点重合；
    this.equalStartPoint = function (x, y) {
        var p = this.can.pointList;
        if (p.length > 2 && Math.abs((x - p[0].pointx) * (x - p[0].pointx)) + Math.abs((y - p[0].pointy) * (y - p[0].pointy)) <= this.can.roundr * this.can.roundr) {
            //如果闭合
            this.can.IsClose = true;
            p[p.length - 1].pointx = p[0].pointx;
            p[p.length - 1].pointy = p[0].pointy;
        } else {
            this.can.IsClose = false;
        }
    }
    //清空画布
    this.clearCan = function () {
        this.can.canvas.clearRect(0, 0, this.can.w, this.can.h);
    }
    //判断鼠标点是不是在圆的内部：
    this.roundIn = function (x, y) {
        //刚开始拖动
        var p = this.can.pointList;
        if (!this.can.juPull) {
            for (var i = 0; i < p.length; i++) {

                if (Math.abs((x - p[i].pointx) * (x - p[i].pointx)) + Math.abs((y - p[i].pointy) * (y - p[i].pointy)) <= this.can.roundr * this.can.roundr) {
                    //说明点击圆点拖动了；
                    this.can.juPull = true;//拖动
                    //
                    this.can.curPointIndex = i;
                    p[i].pointx = x;
                    p[i].pointy = y;
                    //重画：
                    this.clearCan();
                    //showImg();
                    if (this.can.IsClose) {
                        this.fillBackColor();
                    }
                    this.drawAllLine();
                    return;
                }
            }
        } else {//拖动中
            p[this.can.curPointIndex].pointx = x;
            p[this.can.curPointIndex].pointy = y;
            //重画：
            this.clearCan();
            if (this.can.IsClose) {
                this.fillBackColor();
            }
            this.drawAllLine();
        }
    };
    //光标移到线上，临时数组添加新的节点：
    this.AddNewNode = function (newx, newy) {
        //如果闭合
        var ii = 0;
        if (this.can.IsClose) {
            //判断光标点是否在线上：
            var p = this.can.pointList;
            for (var i = 0; i < p.length - 1; i++) {
                //计算a点和b点的斜率
                // var k =(p[i + 1].pointy - p[i].pointy) / (p[i + 1].pointx - p[i].pointx);
                var result = false;
                if (parseFloat(p[i + 1].pointx) - parseFloat(p[i].pointx) != 0) {
                    var k = parseFloat((p[i + 1].pointy - p[i].pointy)) / (p[i + 1].pointx - p[i].pointx);
                    var b = p[i].pointy - k * p[i].pointx;
                    var userK = parseFloat(k * newx + b);
                    if (((userK < newy + 4 && userK > newy - 4) || (parseInt(userK) == parseInt(newy))) && (newx - p[i + 1].pointx) * (newx - p[i].pointx) <= 2 && (newy - p[i + 1].pointy) * (newy - p[i].pointy) <= 2) {
                        var aa = Math.abs(p[i + 1].pointx - p[i].pointx - 3);
                        var ab = Math.abs(p[i + 1].pointx - newx);
                        var ac = Math.abs(newx - p[i].pointx);
                        var ba = Math.abs(p[i + 1].pointy - p[i].pointy - 3);
                        var bb = Math.abs(p[i + 1].pointy - newy);
                        var bc = Math.abs(newy - p[i].pointy);
                        if (aa <= 2 || aa >= 4) {
                            if (ab <= aa && ac <= aa && bb <= ba && bc <= ba) {
                                result = true;
                            }
                        } else {
                            if (ab <= aa && ac <= aa) {
                                result = true;
                            }
                        }
                    }
                }
                //考虑接近垂直的情况
                if (parseFloat(p[i + 1].pointx) - parseFloat(p[i].pointx) == 0 || (Math.abs(parseFloat(p[i + 1].pointx) / parseFloat(p[i].pointx)) >= 15)) {
                    if (p[i].pointx + 3 >= newx && p[i].pointx - 3 <= newx) {
                        var ba = Math.abs(p[i + 1].pointy - p[i].pointy - 3);
                        var bb = Math.abs(p[i + 1].pointy - newy);
                        var bc = Math.abs(newy - p[i].pointy);
                        if (bb <= ba && bc <= ba) {
                            result = true;
                        }
                    }
                }
                if (result) {
                    //
                    //parseInt(k * newx + b) == parseInt(newy)
                    //添加临时点：
                    this.can.tempPointList[0] = new this.point(newx, newy);//新的坐标点
                    this.can.tempPointList[1] = new this.point(i + 1, i + 1);//需要往pointlist中插入新点的索引；
                    i++;
                    //光标移动到线的附近如果是闭合的需要重新划线，并画上新添加的点；
                    if (this.can.tempPointList.length > 0) {
                        //重画：
                        this.clearCan();
                        //showImg();
                        if (this.can.IsClose) {
                            this.fillBackColor();
                        }
                        this.drawAllLine();
                        this.drawArcBig(this.can.tempPointList[0].pointx, this.can.tempPointList[0].pointy);
                        return;
                    }
                    return;
                } else {
                    // $("#Text1").val("");
                }
            }
            if (ii == 0) {
                if (this.can.tempPointList.length > 0) {
                    //清空临时数组；
                    this.can.tempPointList.length = 0;
                    //重画：
                    this.clearCan();
                    //showImg();
                    if (this.can.IsClose) {
                        this.fillBackColor();
                    }
                    this.drawAllLine();
                    //this.drawArc(this.can.tempPointList[0].pointx, this.can.tempPointList[0].pointy);
                }
            }
        } else {
            //防止计算误差引起的添加点，当闭合后，瞬间移动起始点，可能会插入一个点到临时数组，当再次执行时，
            //就会在非闭合情况下插入该点，所以，时刻监视：
            if (this.can.tempPointList.length > 0) {
                this.can.tempPointList.length = 0;
            }
        }
    }
    this.notEmptyObj = function (obj) {
        if (obj != null && obj != undefined && obj != "") {
            return true;
        }
        return false;
    }
    this.createCutImg = function (fun) {
        var tempPointArray;
        var tempPointList;
        if (this.notEmptyObj(this.can.pointList) && this.can.pointList.length > 1) {
            tempPointList = JSON.parse(JSON.stringify(this.can.pointList));
            tempPointArray = this.movePointArray(tempPointList);
        } else {
            this.defaults.showTip("请先进行抠图操作");
            return;
        }
        var proxy = this;
        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = this.defaults.imgSrc;
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = tempPointArray[1].pointx - tempPointArray[0].pointx;
            canvas.height = tempPointArray[1].pointy - tempPointArray[0].pointy;
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < tempPointList.length; i++) {
                ctx.lineTo(tempPointList[i].pointx, tempPointList[i].pointy);
            }
            ctx.lineTo(tempPointList[0].pointx, tempPointList[0].pointy);
            ctx.clip();
            ctx.drawImage(img, tempPointArray[0].pointx * -1, tempPointArray[0].pointy * -1, proxy.img.w, proxy.img.h);
            fun(canvas.toDataURL("image/png"), canvas.width, canvas.height);
        };
    }
    this.downLoad = function () {
        var tempPointArray;
        var tempPointList;
        if (this.notEmptyObj(this.can.pointList) && this.can.pointList.length > 1) {
            tempPointList = JSON.parse(JSON.stringify(this.can.pointList));
            tempPointArray = this.movePointArray(tempPointList);
        } else {
            this.defaults.showTip("请先进行抠图操作");
            return;
        }
        var proxy = this;
        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = this.defaults.imgSrc;
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = tempPointArray[1].pointx - tempPointArray[0].pointx;
            canvas.height = tempPointArray[1].pointy - tempPointArray[0].pointy;
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < tempPointList.length; i++) {
                ctx.lineTo(tempPointList[i].pointx, tempPointList[i].pointy);
            }
            ctx.lineTo(tempPointList[0].pointx, tempPointList[0].pointy);
            ctx.clip();
            ctx.drawImage(img, tempPointArray[0].pointx * -1, tempPointArray[0].pointy * -1, proxy.img.w, proxy.img.h);
            var fileName = "target.png";
            if (window.navigator.msSaveOrOpenBlob) {
                var imgData = canvas.msToBlob();
                var blobObj = new Blob([imgData]);
                window.navigator.msSaveOrOpenBlob(blobObj, fileName);
            } else {
                var imgData = canvas.toDataURL("image/png");
                var a = document.createElement('a');
                var event = new MouseEvent('click');
                a.download = fileName;
                a.href = imgData;
                a.dispatchEvent(event);
            }
        };
    }
    this.movePointArray = function (pointArray) {
        var smallX = pointArray[0].pointx;
        var smallY = pointArray[0].pointy;
        var bigX = smallX;
        var bigY = smallY;
        var tempArray = new Array();
        for (var i = 1; i < pointArray.length; i++) {
            if (pointArray[i].pointx < smallX) {
                smallX = pointArray[i].pointx;
            }
            if (pointArray[i].pointx > bigX) {
                bigX = pointArray[i].pointx;
            }
            if (pointArray[i].pointy < smallY) {
                smallY = pointArray[i].pointy;
            }
            if (pointArray[i].pointy > bigY) {
                bigY = pointArray[i].pointy;
            }
        }
        for (var i = 0; i < pointArray.length; i++) {
            pointArray[i].pointx -= smallX;
            pointArray[i].pointy -= smallY;
        }
        tempArray[0] = new this.point(smallX, smallY);
        tempArray[1] = new this.point(bigX, bigY);
        return tempArray;
    }
}