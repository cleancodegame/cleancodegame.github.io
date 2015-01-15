(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var GameView = require("./GameView");

function renderGame(component){
	React.render(component, document.getElementById("gameContainer"));
};

var AppView = React.createClass({displayName: "AppView",
	propTypes: {
		levelsHolder: React.PropTypes.object.isRequired
	},
	getInitialState: function() {
		return {
			started: false
		};
	},
	render: function() {
		return (
			React.createElement("div", null, 
				this.renderHeader(), 
			  	this.renderBody(), 
				this.renderFooter()
			  )
			  );
	},

	renderHeader: function(){
		var classes = "header-text" + (this.state.started ? '' : ' tall');
		return React.createElement("div", {className: "header"}, 
		    React.createElement("div", {className: "container header"}, 
		      React.createElement("div", {className: classes}, 
		      React.createElement("h1", {className: "pointer", onClick: this.handleHome}, "The Clean Code Game"), 
		      React.createElement("h2", null, "Версия C#")
		      )
		    )
		  )
	},

	handleHome: function(){
		window.location.reload();
	},

	renderBody: function(){
		if (this.state.started)
			return React.createElement("div", {className: "container"}, 
					React.createElement(GameView, {levels: this.props.levelsHolder.levels})
				)
		else
			return this.renderIntro();
	},

	renderIntro: function(){
		return React.createElement("div", {className: "container body"}, 
		    React.createElement("div", {className: "home-text"}, 
		      React.createElement("p", null, 
		        "Все хотят иметь дело только", React.createElement("br", null), 
		        "с понятным чистым кодом.", React.createElement("br", null), 
		        "Но не все могут его создавать."
		      ), 
		      React.createElement("p", null, "Проверь себя!"), 
		      React.createElement("p", null, React.createElement("button", {className: "btn btn-lg btn-primary btn-styled", onClick: this.handleClick}, "Начать игру"))
		    ), 
			React.createElement("img", {className: "home-cat", src: "img/cat.png"}), 
		    React.createElement("div", {className: "clearfix"})
		  )
	},

	handleClick: function(){
		if (this.props.levelsHolder.ready){
			this.setState({
				started: true
			});
		}
	},

	renderFooter: function(){
		return React.createElement("div", {className: "footer"}, 
			    React.createElement("div", {className: "container"}, 
			      React.createElement("p", {className: "text-muted"}, 
			        "© 2015 ", React.createElement("a", {href: "https://kontur.ru/career"}, "СКБ Контур")
			      )
			    )
			  );
	}
});

React.render(React.createElement(AppView, {levelsHolder: levelsHolder}), document.getElementById("app"));
},{"./GameView":6}],2:[function(require,module,exports){
var BooksView = React.createClass({displayName: "BooksView",
	books: [
		{
			title: 'Чистый код. Роберт Мартин',
			img: 'img/cleancode.jpg',
			url: 'http://www.ozon.ru/context/detail/id/21916535/'
		},
		{
			title: 'Совершенный код. Стив Макконнелл',
			img: 'img/codecomplete.jpg',
			url: 'http://www.ozon.ru/context/detail/id/3159814/'
		}
	],
	render: function() {
		return (
			React.createElement("div", null, 
				React.createElement("p", null, "Больше и подробнее про чистый код можно узнать из этих замечательных книг:"), 
				React.createElement("div", {className: "books pull-left"}, 
					_(this.books).map(function(b){
						return React.createElement("a", {className: "book", key: b.title, target: "blank", 
								title: b.title, href: b.url}, React.createElement("img", {src: b.img, alt: b.title}))
					}), 
					React.createElement("img", {className: "book", src: "img/cat.png", width: "250", alt: "Чистый кот"})
				), 
				React.createElement("div", {className: "clearfix"})
			)
			);
	}
});

module.exports = BooksView;
},{}],3:[function(require,module,exports){
'use strict';

var _ = require("lodash");
var utils = require("./utils");

var CodeSample = function(data) {
	var me = this;
	this.name = data.name;
	this.code = data.code.replace('\r', '');
	this.bugs = data.bugs;
	this.bugsCount = _.keys(this.bugs).length;

	parseCode();

	function parseCode(code) {
		_.each(_.values(me.bugs), function(bug) {
			bug.offsets = []
		});
		_.each(_.keys(me.bugs), function(bugName) {
			me.bugs[bugName].name = bugName
		});
		var resultOffset = 0;
		me.text = me.code
			.replace(/{{([\s\S]*?)}}/gm, function(sub, p, offset, s) {
				var start = offset - resultOffset;
				resultOffset += 4;
				addBugPosition(p, start, p.length);
				return p;
			});
		addBugLinePositions();
	}

	function addBugPosition(token, start, len) {
		var name = token.trim().split(' ', 2)[0];
		var bug = me.bugs[name];
		if (bug == undefined) {
			console.log(me.bugs);
			throw new Error("In code " + data.name +" unknown bug " + name);
		}
		bug.content = token;
		bug.offsets.push({
			startIndex: start,
			len: len
		});
	}

	function addBugLinePositions() {
		var eols = [-1];
		for (var i = 0; i < me.text.length; i++) {
			if (me.text[i] == '\n')
				eols.push(i);
		}
		eols.push(1000000000);
		_.each(_.values(me.bugs), function(bug) {
			bug.offsets.forEach(function(off) {
				off.start = getPos(off.startIndex, eols);
				off.end = getPos(off.startIndex + off.len - 1, eols);
			});
		});
	}

	function getPos(pos, eols) {
		for (var line = 0; line < eols.length; line++)
			if (eols[line] >= pos) {
				return {
					line: line - 1,
					ch: pos - eols[line - 1] - 1
				};
			}
		return null;
	}

	function containPos(offset, line, ch) {
		return (offset.start.line < line || (offset.start.line == line && offset.start.ch <= ch + 1)) && (offset.end.line > line || (offset.end.line == line && offset.end.ch >= ch - 1))

	}

	this.findBug = function(line, ch) { //return Bug
		for (var bugName in me.bugs) {
			var bug = me.bugs[bugName];
			var offsets = bug.offsets.filter(function(off) {
				return containPos(off, line, ch);
			});
			if (offsets.length != 0) return bug;
		}
		return null;
	};

	this.fix = function(bug) { //return CodeSample
		var code2 = this.code.replace(new RegExp("\\{\\{" + utils.escapeRe(bug.content) + "\\}\\}", "gm"), bug.replace);
		var bugs2 = _.cloneDeep(this.bugs);
		delete bugs2[bug.name];
		return new CodeSample({
			name: this.name,
			code: code2,
			bugs: bugs2
		});
	}
};

module.exports = CodeSample;
},{"./utils":9,"lodash":undefined}],4:[function(require,module,exports){
var CodeView = React.createClass({displayName: "CodeView",
	propTypes: {
		code: React.PropTypes.string.isRequired,
		onClick: React.PropTypes.func.isRequired
	},

	getDefaultProps: function() {
		return {
			lineNumbers: false,
			mode: "text/x-csharp",
			readOnly: "nocursor",
		};
	},

	componentDidMount: function() {
		this.editor = CodeMirror.fromTextArea(this.refs.editor.getDOMNode(), this.props);
		this.getDOMNode().onmouseup =
			function(ev){
				var sel = this.editor.doc.sel.ranges[0].head;
				var word = $(ev.target).text();
				this.props.onClick(sel.line, sel.ch, word);
			}.bind(this);
	},

    componentDidUpdate: function() {
    	if (this.editor) {
        	this.editor.setValue(this.props.code);
    	}
    },

	render: function() {
		return (
			React.createElement("div", null, 
				React.createElement("textarea", {
					ref: "editor", 
					defaultValue: this.props.code, 
					readOnly: "true"})
			));
	}
});

module.exports = CodeView;
},{}],5:[function(require,module,exports){
var BooksView = require("./BooksView");

var GameOverView = React.createClass({displayName: "GameOverView",
	propTypes: {
		onPlayAgain: React.PropTypes.func.isRequired
	},

	render: function() {
		return React.createElement("div", null, 
			React.createElement("h2", null, "Вы проиграли!"), 
			React.createElement("p", null, 
				"Это была плохая новость." + ' ' +
				"Хорошая новость — вам есть куда расти!"
			), 
			React.createElement(BooksView, null), 

			React.createElement("p", null, 
				"Впрочем, возможно, вам просто не повезло. Попробуйте ещё раз!"
			), 

			React.createElement("button", {className: "btn btn-lg btn-primary btn-styled", onClick: this.props.onPlayAgain}, "Ещё раз")
		);
	},
});

module.exports = GameOverView;
},{"./BooksView":2}],6:[function(require,module,exports){
var CodeSample = require("./CodeSample");
var LevelView = require("./LevelView");
var ResultsView = require("./ResultsView");
var GameOverView = require("./GameOverView");


function removeHash () { 
    history.pushState("", document.title, window.location.pathname + window.location.search);
}

function getHash(){
	if (window.location.hash !== undefined && window.location.hash.length > 0)
		return Math.max(0, ~~window.location.hash.substring(1) - 1);
	else
		return 0;
}


var GameView = React.createClass({displayName: "GameView",
	propTypes: {
		levels: React.PropTypes.array.isRequired,
	},

	getInitialState: function() {
		var levelIndex = getHash();
		return {
			levelIndex: levelIndex,
			maxScore: 0,
			score: 0,
			time: new Date().getTime()
		};
	},

	render: function() {
		if (this.state.score < 0)
			return React.createElement(GameOverView, {onPlayAgain: this.handlePlayAgain});
		else if (this.state.levelIndex >= this.props.levels.length){
			_gaq.push(['_trackEvent', 'result', 'result.' + this.state.score, '']);
			removeHash();
			return React.createElement(ResultsView, {	
				score: this.state.score, 
				maxScore: this.state.maxScore, 
				onPlayAgain: this.handlePlayAgain});
		}
		else 
			return React.createElement(LevelView, {
					key: "level_" + this.state.levelIndex, 
					level: this.state.levelIndex, 
					score: this.state.score, 
					codeSample: this.level(), 
					onNext: this.handleNext});

	},

	level: function(index){
		index = index !== undefined ? index : this.state.levelIndex;
		if (index >= this.props.levels.length)
			throw new Error("Invalid level " + index);
		return new CodeSample(this.props.levels[index]);
	},

	handleNext: function(score){
		var elapsed = new Date().getTime() - this.state.time;
		var category = 'level-solved';
		var event = category + '.' + this.state.levelIndex;
		_gaq.push(['_trackEvent', category, event, event + '.' + elapsed]);
		this.setState({
			score: score,
			maxScore: this.state.maxScore + this.level().bugsCount,
			levelIndex: this.state.levelIndex+1,
			time: new Date().getTime()
		});
	},

	handlePlayAgain: function(){
		this.setState(this.getInitialState());
	}

});

module.exports = GameView;
},{"./CodeSample":3,"./GameOverView":5,"./LevelView":7,"./ResultsView":8}],7:[function(require,module,exports){
var CodeView = require("./CodeView");
var CodeSample = require("./CodeSample");
var utils = require("./utils");
var animate = utils.animate;

var HintButton = React.createClass({displayName: "HintButton",
	propTypes: {
		text: React.PropTypes.string,
		onUsed: React.PropTypes.func
	},

	handleClick: function(){
		bootbox.alert(this.props.text, this.props.onUsed);
	},

	render: function() {
		if (this.props.text !== undefined)
			return React.createElement("span", {className: "tb-item", onClick: this.handleClick}, "подсказка");
		else 
			return React.createElement("span", {className: "tb-item disabled"}, "подсказок нет")
	}
});

var HoverButton = React.createClass({displayName: "HoverButton",
	propTypes: {
		text: React.PropTypes.string.isRequired,
		enabled: React.PropTypes.bool.isRequired,
		onEnter: React.PropTypes.func.isRequired,
		onLeave: React.PropTypes.func.isRequired
	},

	render: function() {
		if (this.props.enabled)
			return React.createElement("span", {className: "tb-item", 
					onMouseEnter: this.props.onEnter, 
					onTouchStart: this.props.onEnter, 
					onMouseLeave: this.props.onLeave, 
					onTouchEnd: this.props.onLeave}, this.props.text)
		else
			return React.createElement("span", {className: "tb-item disabled"}, this.props.text)
	},


});

var LevelView = React.createClass({displayName: "LevelView",
	propTypes: {
		level: React.PropTypes.number.isRequired,
		score: React.PropTypes.number.isRequired,
		codeSample: React.PropTypes.instanceOf(CodeSample).isRequired,
		onNext: React.PropTypes.func.isRequired
	},

	getInitialState: function() {
		return {
			codeSample : this.props.codeSample,
			score : this.props.score,
			descriptions: [],
			availableHints: _.values(this.props.codeSample.bugs),
			showOriginal: false
		};
	},

	finished: function(){
		return this.state.codeSample.bugsCount == 0;
	},

	handleMiss: function (line, ch, word){
		word = word.trim().substring(0, 20);
		var category = "miss."+this.props.codeSample.name;
		var miss = category + "." + word;
		console.log(miss);
		if (!this.trackedMisses[miss]){
			_gaq.push(['_trackEvent', category, miss, category + ' at ' + line + ':'+ch]);
			this.trackedMisses[miss] = true;
			this.reduceScore();
		}
	},

	handleFix: function(bug){
		var descriptions = _.union(this.state.descriptions, [bug.description]);
		var fixedCode = this.state.codeSample.fix(bug);
		var lastHint = this.state.availableHints[0];
		var newHints = _.filter(this.state.availableHints, function(h) { return h.name != bug.name });

		this.setState({
			codeSample: fixedCode,
			score: this.state.score + 1,
			deltaScore: +1,
			availableHints: newHints,
			descriptions: descriptions
		});
	},

	reduceScore: function(){
		this.setState({
			score: this.state.score - 1,
			deltaScore: -1
		});
		if (this.state.score < 0)
			this.handleNext(this.state.score);
	},

	handleClick: function(line, ch, word){
		if (this.finished()) return;
		var bug = this.state.codeSample.findBug(line, ch);

		if (bug != null){
			this.handleFix(bug);
		}
		else {
			this.handleMiss(line, ch, word);
		}
	},

	componentDidMount: function() {
		this.trackedMisses = {};
		animate(this.refs.round, "fadeInRight");
	},

	handleUseHint: function(){
		var category = "hint."+this.props.codeSample.name;
		var hint = this.state.availableHints[0].description.substring(0, 20);
		_gaq.push(['_trackEvent', category, category + "." + hint, category + "." + hint]);
		this.setState({
			availableHints: this.state.availableHints.slice(1),
			score: Math.max(this.state.score - 1, 0),
			deltaScore: -1
		});
	},

	componentDidUpdate: function(prevProps, prevState) {
		if (prevState.codeSample.bugsCount != this.state.codeSample.bugsCount)
			animate(this.refs.bugsCount, "bounce");
		if (this.finished && prevState.codeSample.bugsCount > 0)
			animate(this.refs.nextButton, "flipInX");
	},

	handleNext: function(){
		animate(this.refs.round, "fadeOutLeft");
		$(this.refs.round.getDOMNode()).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			
			console.log(this.state.score);
			this.props.onNext(this.state.score);
		}.bind(this));		
	},
	
	renderExplanations: function(){
		if (this.state.descriptions.length == 0) return "";
		return React.createElement("div", null, 
			React.createElement("h3", null, "Объяснения:"), 
			React.createElement("ol", null, 
				 this.state.descriptions.map(function(d, i){ return React.createElement("li", {key: i}, d) }) 
			)
		)
	},

	renderNextButton: function(){
		if (!this.finished()) return "";
		return React.createElement("button", {ref: "nextButton", 
				className: "btn btn-lg btn-primary btn-styled btn-next", 
				onClick: this.handleNext}, "Дальше")
	},

	getHint: function(){
		if (this.state.availableHints.length > 0)
			return this.state.availableHints[0].description;
		else
			return undefined;
	},

	render: function() {
		var code = this.state.showOriginal ? this.props.codeSample : this.state.codeSample; //from props or from state?
		var hasProgress = this.state.codeSample.bugsCount < this.props.codeSample.bugsCount;
		return  (
			React.createElement("div", {className: "round", ref: "round"}, 
			  React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "col-sm-12"}, 
					React.createElement("h2", null, "Уровень ", this.props.level+1, this.finished() && ". Пройден!"), 
					React.createElement("p", null, "Найди и исправь все стилевые ошибки в коде. Кликай мышкой по ошибкам!"), 
					React.createElement("div", {className: "code-container"}, 
						React.createElement("span", {className: "code-toolbar"}, 
							React.createElement(HoverButton, {text: "сравнить", enabled: hasProgress, onEnter: this.showOriginalCode, onLeave: this.showCurrentCode}), 
							React.createElement(HintButton, {text: this.getHint(), onUsed: this.handleUseHint})
						), 
						React.createElement(CodeView, {code: code.text, onClick: this.handleClick})
					)
				)
			  ), 
			  React.createElement("div", null, 
				this.renderNextButton()
				), 
			  React.createElement("div", {className: "row"}, 
			  	React.createElement("div", {className: "col-sm-4"}, 
					React.createElement("div", {ref: "scoreDiv", className: "score"}, 
						React.createElement("div", {className: "pull-left"}, 
							"Общий счёт:" 
						), 
						React.createElement("div", {className: "pull-left score-value", ref: "score"}, this.state.score), 
						 this.state.deltaScore < 0
							? React.createElement("div", {key: this.state.score, className: "pull-left minus-one animated fadeOutDown"}, " —1")
							: null, 
						React.createElement("div", {className: "clearfix"})
					)
			  	), 
			  	React.createElement("div", {className: "col-sm-5"}, 
					React.createElement("div", {className: "score"}, 
						"Осталось найти: ", React.createElement("span", {ref: "bugsCount"}, this.state.codeSample.bugsCount)
					)
			  	)
			  	), 
			  	React.createElement("div", {className: "row"}, 
				  	React.createElement("div", {className: "col-sm-12"}, 
						this.renderExplanations()
				  	)
			  	)
			)
			);
	},

	showOriginalCode: function() {
		this.setState({ showOriginal: true, deltaScore: 0 });
	},

	showCurrentCode: function() {
		this.setState({ showOriginal: false, deltaScore: 0 });
	},
});

module.exports=LevelView;
},{"./CodeSample":3,"./CodeView":4,"./utils":9}],8:[function(require,module,exports){
var BooksView = require("./BooksView");

var ResultsView = React.createClass({displayName: "ResultsView",
	propTypes: {
		score: React.PropTypes.number.isRequired,
		maxScore: React.PropTypes.number.isRequired,
		onPlayAgain: React.PropTypes.func.isRequired
	},

	componentDidMount: function() {
        $("#uptolikescript").remove();
        s = document.createElement('script');
        s.id="uptolikescript";
        s.type = 'text/javascript'; s.charset='UTF-8'; s.async = true;
        s.src = ('https:' == window.location.protocol ? 'https' : 'http')  + '://w.uptolike.com/widgets/v1/uptolike.js';
        document.getElementsByTagName('body')[0].appendChild(s);
	},

	getScorePercentage: function(){
		if (this.props.maxScore <= 0) return 0;
		return Math.round(100 * this.props.score / this.props.maxScore);
	},


	render: function() {
		var rate = this.getScorePercentage();
		if (rate == 100) 
			return this.renderVerdict(
				"Ого! Да перед нами профи!", 
				"Раздражает неряшливый код коллег? Поделись с ними этой игрой, и их код станет чуточку лучше! ;-)");
		else if (rate > 60)
			return this.renderVerdict(
				"Неплохо, неплохо. Но можно и лучше", 
				"Поделись этой игрой с коллегами, и их код тоже станет чуточку лучше! ;-)");
		else
			return this.renderVerdict(
				"Ну, по крайней мере ты добрался до конца!", 
				"Поделись этой игрой с коллегами, вдруг они наберут ещё меньше очков! :-D");
	},

	renderVerdict: function(headerPhrase, sharePhrase){
		return (
			React.createElement("div", null, 
				React.createElement("h2", null, headerPhrase), 
				this.renderScoreInfo(), 
				this.renderAgainButton(), 
				React.createElement(BooksView, null), 
				React.createElement("p", null, 
				sharePhrase
				), 
				this.renderShareButtons()
			));
	},

	renderScoreInfo: function(){
		return (
			React.createElement("p", null, this.getScorePercentage(), "% очков (", this.props.score, " из ", this.props.maxScore, " возможных).")
			);
	},

	renderAgainButton: function(){
		return React.createElement("p", null, React.createElement("a", {href: "#", onClick: this.props.onPlayAgain}, "Ещё разик?"))
	},

	renderShareButtons: function(){
		return (
			React.createElement("div", {className: "share"}, 
				React.createElement("div", {className: "uptolike-container"}, 
					React.createElement("div", {"data-share-size": "40", "data-like-text-enable": "false", "data-background-alpha": "0.0", "data-pid": "1330841", "data-mode": "share", "data-background-color": "#ffffff", "data-share-shape": "rectangle", "data-share-counter-size": "12", "data-icon-color": "#ffffff", "data-text-color": "#000000", "data-buttons-color": "#ffffff", "data-counter-background-color": "#ffffff", "data-share-counter-type": "disable", "data-orientation": "horizontal", "data-following-enable": "false", "data-sn-ids": "fb.vk.tw.", "data-selection-enable": "false", "data-exclude-show-more": "false", "data-share-style": "1", "data-counter-background-alpha": "1.0", "data-top-button": "false", className: "uptolike-buttons"})
				)
			));
	},
});

module.exports = ResultsView;
},{"./BooksView":2}],9:[function(require,module,exports){
'use strict';

module.exports.animate = function(comp, effect){
    if (!comp) return;
    var $el = $(comp.getDOMNode());
    $el.addClass("animated-fast " + effect);
    $el.one(
        'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', 
        function(){$el.removeClass("animated " + effect)}
    );
};

module.exports.escapeRe = function(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
},{}]},{},[1]);
