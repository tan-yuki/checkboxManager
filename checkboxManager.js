$(document).ready(function(){

	var Level = function(){};
	Level.prototype = {
		label : null,

		childLevel : null,

		parentLevel : null,

		getSiblings : function(level) {
			if (! level instanceof Level) {
				return null;
			}

			// Surprisingly, null instanceof Object is TRUE!!!
			if (! level) {
				return null;
			}

			var siblings = $("input." + level.label + "[type=checkbox]");
			if(siblings.length === 0) {
				return null;
			}
			return siblings;
		
		},

		getNeighborsBy : function(level, target) {
			if(! level) {
				return null;
			}

			var siblings = this.getSiblings(level);

			var group = this.getGroupOf(target);
			if(group) {
				siblings = siblings.filter(function(){
					return $(this).parents("li." + group).length > 0;
				});
			}
			return siblings;
		
		},

		getChildren : function(target) {
			return this.getNeighborsBy(this.childLevel, target);
		},

		getParent : function(target) {
			return this.getNeighborsBy(this.parentLevel, target);
		},

		click : function(target) {
			var children = this.getChildren(target);
			if(children) {
				children = children.filter(function(){
					if (manager.doCheck) {
						// OFF -> ON
						return  ! $(this).attr("checked");
					} else {
						// ON -> OFF
						return  $(this).attr("checked");
					}
				})
				
				children.each(function(){
					$(this).trigger("click", [true]);
				});
			}

			// sync checked or de-checked status
			this.sync(target);
		},

		sync : function(target) {
			var parent = this.getParent(target);
			if(! parent || parent.length === 0) {
				return false;
			}

			var neighbors = this.getNeighborsBy(this, target);
			var changeStatus = true;
			neighbors.each(function(){
				if(manager.doCheck) {
					// ON
					if(! $(this).attr("checked")) {
						changeStatus = false;
						return false;
					}
				} else {
					// OFF
					if($(this).attr("checked")) {
						changeStatus = false;
						return false;
					}
				}
			});

			if (changeStatus) {
				if (manager.doCheck) {
					parent.attr("checked", "checked");
				} else {
					parent.attr("checked", false);
				}
			}

			this.parentLevel.sync(parent);
		},

		getGroupOf : function(target) {
			if(! target) {
				return false;
			}

			return target.parents("li").eq(0).attr("class");
		}
	}

	var Level1 = function(){};
	Level1.prototype = $.extend({}, Level.prototype, {
		label : "level1"
	});

	var Level2 = function(){};
	Level2.prototype = $.extend({}, Level.prototype, {
		label : "level2"
	});

	var Level3 = function(){};
	Level3.prototype = $.extend({}, Level.prototype, {
		label : "level3",

		getChildren : function(target) {
			return target
					.parent("dt")
					.next("dd")
					.find("input."+ this.childLevel.label + "[type=checkbox]");
		}
	});

	var Level4 = function(){};
	Level4.prototype = $.extend({}, Level.prototype, {
		label : "level4",

		getParent : function(target) {
			return target
					.parents("dd")
					.prev("dt")
					.find("input."+ this.parentLevel.label + "[type=checkbox]");
		},

		getGroupOf : function(target) {
			return target.parents("dl").parent("li").attr("class");
		},

		getNeighborsBy : function(level, target) {
			if(! level) {
				return null;
			}

			return target.parents("ul").eq(0).find("input[type=checkbox]");
		},
	});

	var EventManager = function(){
		this.level1 = new Level1();
		this.level2 = new Level2();
		this.level3 = new Level3();
		this.level4 = new Level4();
	
		// set relationship
		this.level1.childLevel = this.level2;
		this.level2.childLevel = this.level3;
		this.level3.childLevel = this.level4;

		this.level2.parentLevel = this.level1;
		this.level3.parentLevel = this.level2;
		this.level4.parentLevel = this.level3;

	};

	EventManager.prototype = {

		doCheck : true,

		manage : function (target) {
			var level;
			if(target.attr("class") === "level1") {
				level = this.level1;
			} else if (target.attr("class") === "level2") {
				level = this.level2;
			} else if (target.attr("class") === "level3") {
				level = this.level3;
			} else if (target.attr("class") === "level4") {
				level = this.level4;
			}

			level.click(target);
		}
	};

	var manager = new EventManager();

	var clickEvent = function(event, fromTrigger){
		var target = $(event.target);
		if(! fromTrigger) {
			manager.doCheck = target.attr("checked");
		}
		manager.manage(target);
	}

	$("input.level1").click(clickEvent);
	$("input.level2").click(clickEvent);
	$("input.level3").click(clickEvent);
	$("input.level4").click(clickEvent);
});
