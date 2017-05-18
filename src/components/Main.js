require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';



//获取图片相关的数据
var imageDatas = require('../data/imageDatas.json');

//利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas=(function genImageURL(imageDatasArr){
	for(var i = 0,j = imageDatas.length;i < j;i++){
		var singleImageData=imageDatasArr[i];
		singleImageData.imageURL=require('../images/'+singleImageData.fileName);
		imageDatasArr[i]=singleImageData;
	}
	return imageDatasArr;
})(imageDatas);

//获取区间的一个随机值
function getRangeRandom(low,high){
	return Math.ceil(Math.random() * (high - low) + low);
}

//获取0~30度的旋转角度值
function get30DegRandom(){
	return ((Math.random() > 0.5 ? '' : '') + Math.ceil(Math.random() * 30));
}

class ImgFigureComponent extends React.Component{
	//聚焦到该图片所对应的位置
	focus(){
		var map = new BMap.Map(this.props.data.id);
		// map.centerAndZoom(new BMap.Point(this.props.data.geoPos[0],this.props.data.geoPos[1]), 15);
		var lng = this.props.data.geoPos[0];
		var lat = this.props.data.geoPos[1];
		var point = new BMap.Point(lng, lat);
		map.centerAndZoom(point, 13);

		//设置点的弹跳动画
		var marker = new BMap.Marker(point);  // 创建标注
		map.addOverlay(marker);               // 将标注添加到地图中
		marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画

		//缩放地图
		setTimeout(function(){
			map.setZoom(15);
		}, 2000);
		map.enableScrollWheelZoom(true);//允许缩放地图
		// map.disableDragging();//禁止拖拽
	}

	//mapClick
	mapClick = (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
	}

	//imgFigure的点击处理函数
	handleClick = (ev) => {
		if (this.props.arrange.isCenter) {
			this.props.inverse();
			this.focus();
		}else{
			this.props.center();
		}

		ev.preventDefault();
		ev.stopPropagation();
	}

	shareBtnClick = (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
	}

	render(){
		let styleObj = {};

		//如果props属性中指定了这张图片的位置，则使用
		if (this.props.arrange.pos) {
			styleObj = this.props.arrange.pos;
		}

		//如何图片有软砖角度且不为0，添加旋转角度
		if (this.props.arrange.rotate) {
			(['MozTransform','msTransform','WebkitTransform','transform']).forEach((value => {
				styleObj[value] = 'rotate('+this.props.arrange.rotate + 'deg)';
			}).bind(this));
		}

		//把中心图片的zindex设成11
		if (this.props.arrange.isCenter) {
			styleObj.zIndex = 11;
		}

		let imgFigureClassName = 'img-figure';
		imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';


		return (
			<figure className={imgFigureClassName}
					style={styleObj}
					onClick={this.handleClick}
					>
				<img src={this.props.data.imageURL}
						alt={this.props.data.title}/>
				<figcaption>
					<h2 className="img-title">{this.props.data.title}</h2>
					<div className="img-back" onClick={this.handleClick}>
						<div className="bd-map" id={this.props.data.id} onClick={this.mapClick} >
						</div>
					</div>
				</figcaption>
			</figure>
		);
	}
}
// <div className="shareBlock">
// 						<button type="button">分享到微博</button>
// 					</div>
//添加控制组件coomponent
class ControllerUnitComponent extends React.Component{
	// 写法有问题：会提示报错cannot read property 'props' of null 在95行
	//原因：还不知道？？？？？
	// handleClick(ev){
	// 	//如果点击的是当前正在选中态的图片，则翻转图片，否则将对应的图片居中
	// 	if (this.props.arrange.isCenter) {
	// 		this.props.inverse();
	// 	}else{
	// 		this.props.center();
	// 	}

	// 	ev.preventDefault();
	// 	ev.stopPropagation();
	// }

	handleClick = (ev) => {
		//如果点击的是当前正在选中态的图片，则翻转图片，否则将对应的图片居中
		if (this.props.arrange.isCenter) {
			this.props.inverse();
		}else{
			this.props.center();
		}

		ev.preventDefault();
		ev.stopPropagation();
	}

	render(){
		let controllerUnitClassName = 'controller-unit';
		//如果对应的是居中图片，显示控制按钮的居中态
		if (this.props.arrange.isCenter) {
			controllerUnitClassName += ' is-center';

			if (this.props.arrange.isInverse) {
				controllerUnitClassName += ' is-inverse';
			}
		}

		return(
			<span className={controllerUnitClassName}
			onClick={this.handleClick}
			/>
			
		);
	}
}

class AppComponent extends React.Component {
	//因为react版本太高，要使用支持es6语法把下面属性定义到app类的构造函数中
	// Constant:{
	// 	centerPos:{
	// 		left:0,
	// 		top:0
	// 	},
	// 	hPosRange:{		//水平方向的取值范围(左右分区)
	// 		leftSecX:[0,0],
	// 		rightSecX:[0,0],
	// 		y:[0,0]
	// 	},
	// 	vPosRange:{ 	//垂直方向上的取值范围(上分区)
	// 		x:[0,0],
	// 		topY:[0,0]
	// 	}
	// };

	//闭包this问题
	center(index){
		return (() =>{this.reArrange(index)}).bind(this);
	}

	// getInitialState(){
	// 	return {
	// 		imgsArrangeArr:[
	// 			{
	// 				pos:{
	// 					left:'0',
	// 					top:'0'
	// 				},
	// 				rotate: 0,			//图片旋转
	// 				isInverse: false	//图片翻转
	// 				isCenter:false
	// 			}
	// 		]
	// 	}
	// }
	//因为getInitialState不支持es6 classes
	constructor(props){
		super(props);
		this.state = {
			imgsArrangeArr:[
				{
	    			pos:{
	    				left:'0',
		    			top:'0'
	    			},
	    			rotate: 0,
	    			isInverse: false,
	    			isCenter: false
	    		}
			]
		};
		this.Constant = {
			centerPos:{
				left:0,
				top:0
			},
			hPosRange:{		//水平方向的取值范围(左右分区)
				leftSecX:[0,0],
				rightSecX:[0,0],
				y:[0,0]
			},
			vPosRange:{ 	//垂直方向上的取值范围(上分区)
				x:[0,0],
				topY:[0,0]
			}
		};
		// this.inverse = function (){
		// 	return function (){
		// 		var imgsArrangeArr = this.state.imgsArrangeArr;

		// 		imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
				
		// 		this.setState({
		// 			imgsArrangeArr:imgsArrangeArr
		// 		});
		// 	}.bind(this)
		// }
	}

	/*
	 *翻转图片
	 *@params index 输出当前被执行inverse操作的图片在对应的图片信息数组中的index值
	 *@return {function} 返回一个闭包函数，其内return一个真正待被执行的函数
	 *?????：搞清楚为什么使用闭包（图片翻转课程05；55）
	*/
	//闭包this问题：说return is not defined；
	inverse(index){
		return ((()=>{
			var imgsArrangeArr = this.state.imgsArrangeArr;

			imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
			
			this.setState({
				imgsArrangeArr:imgsArrangeArr
			});
		}).bind(this));
	}

	//重新布局所有图片，
	//@params centerIndex 指定居中排布哪个图片
	reArrange(centerIndex){
		var imgsArrangeArr = this.state.imgsArrangeArr,
			Constant = this.Constant,
			centerPos = Constant.centerPos,
			hPosRange = Constant.hPosRange,
			vPosRange = Constant.vPosRange,
			hPosRangeLeftSecX = hPosRange.leftSecX,
			hPosRangeRightSecX = hPosRange.rightSecX,
			hPosRangeY = hPosRange.y,
			vPosRangeX = vPosRange.x,
			vPosRangeTopY = vPosRange.topY,

			imgsArrangeTopArr = [],
			topImgNum = Math.floor(Math.random() * 2), 	//取1个或者不取
			topImgSpliceIndex = 0,

			imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

			//首先居中 centerIndex 的图片,centerIndex 的图片不用旋转
			imgsArrangeCenterArr[0] = {
				pos:centerPos,
				rotate:0,
				isCenter:true
			}

			//取出要布局上侧图片的状态信息???????
			topImgSpliceIndex = Math.ceil(Math.random() *(imgsArrangeArr.length - topImgNum));
			imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

			//布局位于上侧的图片
			imgsArrangeTopArr.forEach(function(value,index){
				imgsArrangeTopArr[index]={
					pos:{
						left:getRangeRandom(vPosRangeX[0],vPosRangeX[1]),
						top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1])
					},
					rotate:get30DegRandom(),
					isCenter:false
				};
			});

			//布局左右两侧的图片
			for(var i = 0, j = imgsArrangeArr.length, k = j / 2;i < j;i++){
				var hPosRangeLORX = null;

				//前半部分布局左边，后半部分布局右边
				if (i < k) {
					hPosRangeLORX = hPosRangeLeftSecX;
				}else{
					hPosRangeLORX = hPosRangeRightSecX;
				}

				imgsArrangeArr[i] = {
					pos:{
						left:getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1]),
						top:getRangeRandom(hPosRangeY[0],hPosRangeY[1])
					},
					rotate:get30DegRandom(),
					isCenter:false
				};
			}

			if (imgsArrangeTopArr && imgsArrangeTopArr[0]){
				imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
			}
			
			imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

			this.setState({
				imgsArrangeArr:imgsArrangeArr
			});
	}

	//组件加载之后，为每张图片计算其位置的范围
	componentDidMount(){
		//首先拿到舞台的大小
		let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
			stageW =stageDOM.scrollWidth,
			stageH = stageDOM.scrollHeight,
			halfStageW = Math.ceil(stageW / 2),
			halfStageH = Math.ceil(stageH / 2);

		//拿到imgFigure的大小
		let	imgFigureDom = ReactDOM.findDOMNode(this.refs.imgFigure0),
			imgW = imgFigureDom.scrollWidth,
			imgH = imgFigureDom.scrollHeight,
			halfImgW = Math.ceil(imgW / 2),
			halfImgH = Math.ceil(imgH / 2);

		//计算中心图片的位置点
		this.Constant.centerPos={
			left:halfStageW - halfImgW,
			top:halfStageH - halfImgH
		};

		//计算左右分区图片排布位置的取值范围
		this.Constant.hPosRange.leftSecX[0] = -halfImgW;
		this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
		this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
		this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
		this.Constant.hPosRange.y[0] = -halfImgH;
		this.Constant.hPosRange.y[0] = stageH - halfImgH;


		//计算上分区图片排布位置的取值范围
		this.Constant.vPosRange.x[0] = halfStageW - imgW;
		this.Constant.vPosRange.x[1] = halfStageW;
		this.Constant.vPosRange.topY[0] = -halfImgH;
		this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;

		this.reArrange(0);
	}

  	render() {
  		let controllerUnits = [],
    		imgFigures=[];

	    imageDatas.forEach(((value,index) => {
	    	if(!this.state.imgsArrangeArr[index]){
	    		this.state.imgsArrangeArr[index] = {
	    			pos:{
	    				left:'0',
		    			top:'0'
	    			},
	    			rotate: 0,
	    			isInverse: false,
	    			isCenter: false
	    		}
    		}
    		//在遍历或者循环输出去渲染子组件的时候，key必不可少
    		imgFigures.push(<ImgFigureComponent key={index}
    									index={index}
    									data={value}
    									ref={'imgFigure'+index}
    									arrange={this.state.imgsArrangeArr[index]}
    									inverse={this.inverse(index)}
    									center={this.center(index)}
    									/>);
    		controllerUnits.push(<ControllerUnitComponent key={index}
    									arrange={this.state.imgsArrangeArr[index]}
    									inverse={this.inverse(index)}
    									center={this.center(index)}
    									/>);
    	}).bind(this));

  //   imageDatas.forEach(function(value,index){
		// if(!this.state.imgsArrangeArr[index]){
		// 	this.state.imgsArrangeArr[index] = {
		// 		pos:{
		// 			left:'0',
	 //    			top:'0'
		// 		}
		// 	};
		// }

		// imgFigures.push(<ImgFigure data={value} ref={'imgFigure'+index} arrange={this.state.imgsArrangeArr[index]}/>)
  //   }.bind(this));

    return (
      	<section className="stage" ref="stage">
      		<section className="img-sec">
      			{imgFigures}
      		</section>
      		<nav className="controller-nav">
      			{controllerUnits}
      		</nav>
      	</section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
