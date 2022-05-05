document.addEventListener("DOMContentLoaded", windowReady);
var themesData = {};

function windowReady() {
  if ($ == null || $ == undefined) {
    setTimeout(windowReady, 1000);
    return;
  }
  console.log("fetch data");

  $.ajax({
    url: "https://antitheos.github.io/TellMeAStory/web-flow-sources/data.json",
    dataType: "json",
  }).done(function (data) {
    themesData = data;

    var el = $("#theme-selector .options");
    for (var x in themesData) {
      var e = $(
        "<div class='option' onclick='playThisTheme(this)'>" +
          data[x].text +
          "</div>"
      );
      e.data("theme", data[x]);
      el.append(e);
    }

    var search = window.location.search.replace("?", "");
    var index = parseInt(search);
    if (!Number.isNaN(index)) {
      if (!playCollection(index)) {
        hasLoaded();
      }
    } else {
      hasLoaded();
    }
  });
}

function hasLoaded() {
  $("body").addClass("loaded");
}

function returnToHome() {
  stopAudio();
  $("body").removeClass("active");
  $("#theme-selector").removeClass("showOptions");
  window.scrollTo(0, 0);
  $("#stories").html("");
  $("#selectedTheme").text("...");
}

function themeSelected(e) {
  var val = $(e).val();
  var th = themesData[val];
  if (th == null) {
    return;
  }

  playTheme(th);
}

function toggleThemesList() {
  $("#selectorsectionwrapper").toggleClass("showOptions");
}

function playThisTheme(e) {
  $("#selectorsectionwrapper").removeClass("showOptions");
  var dt = $(e).data("theme");
  playTheme(dt);
}

function playTheme(th) {
  collectionThemes = null;
  $("body").addClass("active");
  showStory(normalizeThemes([th.text]), th.list, false);
}

function selectRandomTheme() {
  var ls = $("#theme-selector .option");

  var index = Math.floor(Math.random() * Math.floor(ls.length - 1));
  var rec = ls[index + 1];
  playThisTheme(rec);
}

function playCollClick(index) {
  if (playCollection(index) && window && window.history) {
    window.history.pushState({}, "Hear", "?" + index);
  }
}

function playCollection(index) {
  if (index < 1 || index > collection.length) {
    return false;
  }
  var colGroup = collection[index - 1];
  if (!colGroup || !colGroup.themes) {
    return false;
  }
  collectionThemes = colGroup.themes;

  var themes = collectionThemes.map((e) => e.toLowerCase().trim());
  var pList = [];
  for (var t in themes) {
    var key = themes[t];
    var data = themesData[key];
    if (!data || !data.list) {
      continue;
    }
    data = data.list.filter(
      (e) => pList.find((p) => p.key == e.key) == undefined
    );
    pList = pList.concat(data);
  }

  //console.log(pList)
  if (pList.length == 0) {
    return false;
  }

  showStory(normalizeThemes(collectionThemes), pList, false, colGroup.text);
  return true;
}

function showRelatedStory(e) {
  var themes = $(e).data("themes");
  var playList = $(e).data("playList").slice(); //randomize order

  showStory(themes, playList, false);
}

function toggleRelatedItems() {
  if (!$("#storiessection").hasClass("displayRelated")) {
    stopAudio();
  }

  $("#storiessection").toggleClass("displayRelated");
  window.scrollTo(0, 0);
  if (!$("#storiessection").hasClass("displayRelated")) {
    $("#audioitem")[0].play();
  }
}

var collectionThemes = null;
var collection = [
  {
    text: "How can we center women in the history of HIV/AIDS?",
    themes: [
      "Knowledge about HIV/AIDS",
      "Partner had HIV/AIDS",
      "In the streets",
      "HIV saved my life",
      "Future",
    ],
  },
  {
    text: "How does family matter in the history of HIV/AIDS?",
    themes: [
      "Childhood",
      "Migrations",
      "Trauma",
      "HIV in families",
      "Children",
    ],
  },
  {
    text: "How do institutions impact women living with HIV/AIDS?",
    themes: [
      "Schooling",
      "Nowhere to go",
      "Incarceration",
      "Surveillance",
      "WIHS",
    ],
  },
  {
    text: "How is health more than the absence of disease?",
    themes: [
      "Partnerships",
      "Addiction & recovery",
      "Social support",
      "Living with HIV",
      "Healing",
    ],
  },
  {
    text: "How have women built healthy worlds?",
    themes: [
      "Health care",
      "Families",
      "Taking charge of health and wellness",
      "Work",
      "Spirituality & Religion",
    ],
  },
];

/* login page */
function doLogin() {
  var name = $("#my-story #name").val();
  var dob = $("#my-story #dob").val();
  $("#my-story .login-failed").addClass("hidden");
  if (name == "ade" && dob == "2022-01-01") {
    $("#my-story .login-section").addClass("hidden");
    $("#my-story .login-failed").addClass("hidden");
    $("#my-story .login-passed").removeClass("hidden");
    $("#play-section").removeClass("hidden");
    playTheme(themesData["healing"]);
  } else {
    $("#my-story .login-passed").addClass("hidden");
    $("#play-section").addClass("hidden");
    $("#my-story .login-failed").removeClass("hidden");
  }
}
