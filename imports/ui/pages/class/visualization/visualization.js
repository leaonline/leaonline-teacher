import { Template } from 'meteor/templating'
import visualizationLanguage from './i18n/visualizationLanguage'
import './visualization.scss'
import './visualization.html'

Template.visualization.onCreated(function () {
  const instance = this
  instance.init({
    useLanguage: [visualizationLanguage],
    onComplete: () => instance.state.set('initComplete', true)
  })
})

Template.visualization.onRendered(function () {
  const instance = this

  instance.autorun(() => {
    const { results } = Template.currentData()
    const initComplete = instance.state.get('initComplete')

    if (!initComplete || !results?.length) { return }

    // get max alpha level & date
    // TODO make this a module with API functions
    var findMaxInAry = {
      getMaxdatesInAry: 0,
      getMaxlevelInAry: 0,
      getMaxNameInAry: 0,
      allDates: [],
      allLevelsData: [],
      allName: [],
      datesHovers: [],
    };

    setTimeout(() => {
      setup(findMaxInAry, results)
      addTable(findMaxInAry, results)
      setNewVerticalGraph({
        container: instance.$('#GraphCol')
      })
    }, 100)
  })
})

Template.visualization.helpers({
  loadComplete () {
    return Template.getState('initComplete')
  }
})

Template.visualization.events({

})

function setup (findMaxInAry, resultData) {
    var xAxisValue = [];
  setXaxisValue();
  function setXaxisValue() {
    for (let i = 1; i <= resultData.length; i++) {
      xAxisValue.push(i);
    }
  }


  for (let i = 0; i < resultData.length; i++) {
    findMaxInAry.getMaxNameInAry = resultData.length;
    findMaxInAry.allName.push(resultData[i].name);
    for (let j = 0; j < resultData[i].allDate.length; j++) {
      findMaxInAry.datesHovers.push(resultData[i].allDate[j].date);
      // console.log("dates :: ", findMaxInAry.datesHovers.push(resultData[i].allDate[j].date));
      if (findMaxInAry.getMaxdatesInAry < resultData[i].allDate.length) {
        findMaxInAry.getMaxdatesInAry = resultData[i].allDate.length;
        findMaxInAry.allDates = resultData[i].allDate;
      }
      if (findMaxInAry.getMaxlevelInAry < resultData[i].allDate[j].level.length) {
        findMaxInAry.getMaxlevelInAry = resultData[i].allDate[j].level.length;
        findMaxInAry.allLevelsData = resultData[i].allDate[j].level;
      }
    }
  }
  // console.log("findMaxInAry :::", findMaxInAry);
  // end max alpha level & date

  // bar chart graph
  var trace = {
    // x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    x: xAxisValue, //done.
    y: [1, 6, 3, 5, 1, 4, 5, 6, 7, 8, 9],
    // y: [],
    // text: ["Text A", "Text B", "Text C", "Text D", "Text E"],
    mode: "markers",
    type: "bar",
    bargap: 0.65,
    marker: {
      color: "#61b187",
      width: 10,
    },
  };
  var traceData = [[]];
  var traceArray = [];

  var graphAllDates = [];
  for (let j = 0; j < findMaxInAry.allLevelsData.length; j++) {
    for (let i = 0; i < findMaxInAry.allDates.length; i++) {
      graphAllDates.push(findMaxInAry.allDates[i].date);
    }
  }

  // value
  var allGraphHoverValue = [];
  for (let i = 0; i < resultData.length; i++) {
    for (let j = 0; j < resultData[i].allDate.length; j++) {
      for (let k = 0; k < resultData[i].allDate[j].level.length; k++) {
        // console.log('alpha level :::', resultData[i].allDate[j].level[k])
        allGraphHoverValue.push(resultData[i].allDate[j].level[k]);
      }
    }
  }
  // console.log("allGraphHoverValue :::", allGraphHoverValue);

  const result =
    allGraphHoverValue.length == 0
      ? []
      : new Array(
      Math.ceil(allGraphHoverValue.length / findMaxInAry.getMaxlevelInAry)
      )
        .fill()
        .map((_) =>
          allGraphHoverValue.splice(0, findMaxInAry.getMaxlevelInAry)
        );
  // console.log('result :::', result);

  var graphValue = [[]];
  var finalGraphValue = [];
  for (let i = 0; i < resultData.length; i++) {
    for (let j = 0; j < findMaxInAry.getMaxdatesInAry; j++) {
      graphValue[[i][j]] = [];
      finalGraphValue.push(graphValue[[i][j]]);
    }
  }
  // console.log("i-j :::", finalGraphValue);

  if (result.length != 0) {
    for (let i = 0; i < finalGraphValue.length; i++) {
      finalGraphValue[i] = result[i];
    }
  }

  var firstDateValue = [];
  var secondDateValue = [];
  var thirdDateValue = [];
  if (result.length != 0) {
    for (let i = 0; i < finalGraphValue.length; i++) {
      if(i%3 === 0){
        firstDateValue.push(result[i]);
      }else if(i%3 === 1){
        secondDateValue.push(result[i]);
      }else if(i%3 === 2){
        thirdDateValue.push(result[i]);
      }
    }
  }
}

function addTable(findMaxInAry, resultData) {
  // new graph
  var graphcard = document.getElementById("graphcard");
  var flexwraper = document.createElement("div");
  flexwraper.classList.add("flexwraper");
  var gActions = document.createElement("div");
  gActions.classList.add("g-actions");

  // graphtitle
  var graphtitle = document.createElement("div");
  graphtitle.classList.add("graphtitle");
  for (let i = 0; i < findMaxInAry.allLevelsData.length; i++) {
    var graphtitleChild = document.createElement("div");
    graphtitleChild.classList.add("graph-title");
    // console.log("allLevelsData :::", findMaxInAry.allLevelsData[i].alpha);
    // graphTitleHtml += findMaxInAry.allLevelsData[i].alpha;
    graphtitleChild.innerHTML = findMaxInAry.allLevelsData[i].alpha;
    graphtitle.appendChild(graphtitleChild);
  }
  // end graphtitle

  // graplist
  var graplist = document.createElement("div");
  graplist.classList.add("graplist");
  graplist.classList.add("customscroll");
  var graphtable = document.createElement("div");
  graphtable.classList.add("graphtable");
  graphtable.id = "graphwrap";

  // graph-wrapper
  for (let level = 0; level < findMaxInAry.allLevelsData.length; level++) {
    var graphWrapper = document.createElement("div");
    graphWrapper.classList.add("graph-wrapper");
    graphtable.appendChild(graphWrapper);

    // graphloop
    for (let date = 0; date < findMaxInAry.allDates.length; date++) {
      var graphloop = document.createElement("div");
      graphloop.classList.add("graphloop");
      graphWrapper.appendChild(graphloop);

      // barchart
      var barchart = document.createElement("div");
      barchart.classList.add("barchart");
      graphloop.appendChild(barchart);

      // barline
      var dropdownvalue = [];
      var trueValue = [];
      for (let i = 0; i < findMaxInAry.allName.length; i++) {
        dropdownvalue.push(findMaxInAry.allName[i]);
        var barline = document.createElement("div");
        barline.classList.add("barline");
        barline.id = resultData[i].name;
        barline.onmouseover = mouseOver;
        barline.onmouseout = mouseOut;
        barline.style =
          "height: " + resultData[i].allDate[date].level[level].value + "0%";
        barline.setAttribute("data-tooltip", "sticky" + i);

        var findSearchData;
        resultData.find((newJSONItem) => {
          if (newJSONItem.name == resultData[i].name) {
            findSearchData = newJSONItem.allDate.find((dateData) => {
              if (dateData.date == findMaxInAry.allDates[date].date) {
                return dateData.level;
              }
            });
          }
        });

        function mouseOver() {
          var ids = document.querySelectorAll(`[id="${resultData[i].name}"]`);
          for (let hoverId = 0; hoverId < ids.length; hoverId++) {
            ids[hoverId].classList.add("hover");
          }
        }
        function mouseOut() {
          var ids = document.querySelectorAll(`[id="${resultData[i].name}"]`);
          for (let hoverId = 0; hoverId < ids.length; hoverId++) {
            ids[hoverId].classList.remove("hover");
          }
        }

        // sticky hover
        var hoverbox = document.createElement("div");
        hoverbox.classList.add("hoverbox");
        hoverbox.id = "mystickytooltip";
        // atip
        var atip = document.createElement("div");
        atip.classList.add("atip");
        atip.id = "sticky" + i;

        // hover data
        var h6 = document.createElement("h5");
        h6.classList.add("mb-0");
        h6.innerHTML = "<b>" + resultData[i].name + "</b>";

        var small = document.createElement("p");
        small.classList.add("dateText");
        small.innerHTML = findMaxInAry.allDates[date].date;

        var alphaLevel = document.createElement("div");
        alphaLevel.classList.add("mt-2");

        var pTag = document.createElement("h6");
        pTag.innerHTML =
          findSearchData.level[0].alpha +
          ":   " +
          findSearchData.level[0].value +
          "0%<br>" +
          findSearchData.level[1].alpha +
          ":   " +
          findSearchData.level[1].value +
          "0%<br>" +
          findSearchData.level[2].alpha +
          ":   " +
          findSearchData.level[2].value +
          "0%<br>" +
          findSearchData.level[3].alpha +
          ":   " +
          findSearchData.level[3].value +
          "0%<br>" +
          findSearchData.level[4].alpha +
          ":   " +
          findSearchData.level[4].value +
          "0%";

        alphaLevel.appendChild(pTag);
        atip.appendChild(h6);
        atip.appendChild(small);
        atip.appendChild(alphaLevel);
        hoverbox.appendChild(atip);
        barline.appendChild(hoverbox);
        // end hover data

        // end atip

        // end sticky hover

        barchart.appendChild(barline);
      }
      // end barline

      // end barchart
    }
    // end graphloop
  }
  // end graph-wrapper

  // graph-bottom-navigation
  var graphBottomNavigation = document.createElement("div");
  graphBottomNavigation.classList.add("graph-bottom-navigation");
  graphBottomNavigation.classList.add("graph-wrapper");
  graphtable.appendChild(graphBottomNavigation);

  // date-lists
  // console.log("findMaxInAry.allName :::", findMaxInAry.allDates);
  for (let i = 0; i < findMaxInAry.allDates.length; i++) {
    var dateLists = document.createElement("div");
    dateLists.classList.add("date-lists");
    dateLists.innerHTML = findMaxInAry.allDates[i].date;
    graphBottomNavigation.appendChild(dateLists);
  }
  // end date-lists

  // end graph-bottom-navigation

  graplist.appendChild(graphtable);
  // end graplist

  flexwraper.appendChild(graphtitle);
  flexwraper.appendChild(graplist);

  // g-actions
  var selctmenu = document.createElement("div");
  selctmenu.classList.add("selctmenu");
  var zoombtn = document.createElement("div");
  zoombtn.classList.add("zoombtn");

  // dropdownmenu
  var dropdownmenu = document.createElement("div");
  dropdownmenu.classList.add("dropdownmenu");
  dropdownmenu.classList.add("dropdown");

  // labelvalue
  var labelvalue = document.createElement("div");
  labelvalue.classList.add("labelvalue");
  labelvalue.setAttribute("data-toggle", "dropdown");

  labelvalue.innerHTML =
    'Personen suchen <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/> </svg>';
  var dropdownMenuBottom = document.createElement("div");
  dropdownMenuBottom.classList.add("dropdown-menu-bottom");
  dropdownMenuBottom.classList.add("dropdown-menu");

  // dropdown-item
  dropdownvalue.push("Alle", "Keiner");
  for (
    let checkName = 0;
    checkName < findMaxInAry.allName.length + 2;
    checkName++
  ) {
    var dropdownItem = document.createElement("div");
    dropdownItem.classList.add("dropdown-item");

    // checkbox
    var input = document.createElement("input");
    input.type = "checkbox";
    input.name = "dropdown";
    input.id = "checkbox" + dropdownvalue[checkName];
    input.onclick = getCheckedValue;
    input.value = dropdownvalue[checkName];
    var lable = document.createElement("label");
    lable.innerHTML = dropdownvalue[checkName];

    function getCheckedValue() {
      var checkBoxChecked = document.getElementById(
        "checkbox" + dropdownvalue[checkName]
      );
      if (checkBoxChecked.checked) {
        trueValue.push(checkBoxChecked.value);
        // console.log("truevalue checked:::", trueValue);
        hoverUserData(trueValue, dropdownvalue);
      } else {
        for (let i = 0; i < trueValue.length; i++) {
          if (trueValue[i] === dropdownvalue[checkName]) {
            trueValue.splice(i, 1);
            // console.log("truevalue unchecked:::", trueValue);
            hoverUserData(trueValue, dropdownvalue);
          }
        }
      }
    }

    dropdownItem.appendChild(input);
    dropdownItem.appendChild(lable);
    // end checkbox

    dropdownMenuBottom.appendChild(dropdownItem);
  }
  // end dropdown-item

  dropdownmenu.appendChild(labelvalue);
  dropdownmenu.appendChild(dropdownMenuBottom);
  // end labelvalue

  selctmenu.appendChild(dropdownmenu);
  // end dropdownmenu

  // zoombar
  var zoombar = document.createElement("div");
  zoombar.id = "zoombar";
  var buttonPlus = document.createElement("button");
  buttonPlus.type = "button";
  buttonPlus.innerHTML = "-";
  buttonPlus.onclick = zoomin;
  var span = document.createElement("span");
  span.id = "zomval";
  span.innerHTML = "200%";
  var buttonMinus = document.createElement("button");
  buttonMinus.type = "button";
  buttonMinus.innerHTML = "+";
  buttonMinus.onclick = zoomout;
  zoombar.appendChild(buttonPlus);
  zoombar.appendChild(span);
  zoombar.appendChild(buttonMinus);
  zoombtn.appendChild(zoombar);
  // end zoombar

  gActions.appendChild(selctmenu);
  gActions.appendChild(zoombtn);
  // end g-actions

  graphcard.appendChild(flexwraper);
  graphcard.appendChild(gActions);
  // end new graph

  function zoomin() {
    var myImg = document.getElementById("graphwrap");
    var zval = document.getElementById("zomval");
    var currWidth = myImg.clientWidth;
    if (currWidth == 2500) return false;
    else {
      myImg.classList.add("zoomin1");
      zval.innerHTML = "100%";
    }
    myImg.classList.remove("zoomout1");
  }

  function zoomout() {
    var myImg = document.getElementById("graphwrap");
    var zval = document.getElementById("zomval");
    var currWidth = myImg.clientWidth;
    if (currWidth == 100) return false;
    else {
      myImg.classList.add("zoomout1");
    }
    myImg.classList.remove("zoomin1");
    zval.innerHTML = "200%";
  }
}

function hoverUserData(value, aryOfUser) {
  if(value.length !== 0){
    if (value.includes("Alle")){
      aryOfUser.map((item) => {
        // console.log('value :::', value)
        var selectedUser = document.querySelectorAll('[id="' + item + '"]');
        for (let i = 0; i < selectedUser.length; i++) {
          selectedUser[i].style.display = "block";
        }
      });
    } else if (value.includes("Keiner")) {
      aryOfUser.map((item) => {
        // console.log("value :::", value);
        var selectedUser = document.querySelectorAll('[id="' + item + '"]');
        for (let i = 0; i < selectedUser.length; i++) {
          selectedUser[i].style.display = "none";
        }
      });
    } else {
      aryOfUser.map((item) => {
        // console.log('item :::', item);
        if (!value.includes(item)) {
          // console.log("element exists :::", item);
          var selectedUser = document.querySelectorAll('[id="' + item + '"]');
          // selectedUser.style = "display: none";
          for (let i = 0; i < selectedUser.length; i++) {
            // console.log("selectedUser :::", selectedUser[i]);
            selectedUser[i].style.display = "none";
          }
          // console.log('selected user :::', selectedUser.length);
        } else if (value.includes("Alle")) {
          console.log("alle :::");
          var selectedUser = document.querySelectorAll('[id="' + item + '"]');
          // selectedUser.style = "display: none";
          for (let i = 0; i < selectedUser.length; i++) {
            // console.log("selectedUser :::", selectedUser[i]);
            selectedUser[i].style.display = "block";
          }
        } else {
          var selectedUser = document.querySelectorAll('[id="' + item + '"]');
          // selectedUser.style = "display: none";
          for (let i = 0; i < selectedUser.length; i++) {
            // console.log("selectedUser :::", selectedUser[i]);
            selectedUser[i].style.display = "block";
          }
        }
      });
    }
  }else{
    aryOfUser.map((item) => {
      // console.log('item :::', item);
      // if (value.includes(item)) {
      // console.log("element exists :::", item);
      var selectedUser = document.querySelectorAll('[id="' + item + '"]');
      // selectedUser.style = "display: none";
      for (let i = 0; i < selectedUser.length; i++) {
        // console.log("selectedUser :::", selectedUser[i]);
        selectedUser[i].style.display = "block";
      }
      // console.log('selected user :::', selectedUser.length);
      // }
    });
  }
}


function setNewVerticalGraph({ container }) {
  // const container = document.getElementById("GraphCol");
  for (let i = 0; i < graphCollection.length; i++) {
    var containerDiv = document.createElement("div");
    var childContainerDiv = document.createElement("div");
    container.appendChild(containerDiv);
    containerDiv.appendChild(childContainerDiv);
    containerDiv.classList.add("containerDivClass", "col-md-4");
    childContainerDiv.classList.add("cardwraper");
    containerDiv.id = graphCollection[i].wrapperId;
    var layout = document.getElementById(graphCollection[i].colsRowId);
    layout.appendChild(containerDiv);
    const card = document.createElement("div");
    childContainerDiv.appendChild(card);
    card.classList.add("newCard");
    var html =
      "<div id='wrapper'><div id='phomematics' class='titleForGraph'><h5>" +
      graphCollection[i].graphTitle +
      "</h5><div class='progress'><div class='progress-bar bg-success' style='width:60%;'></div></div></div><div class='row m-0 mt-3'><div class='col text-info bold' style='text-align: center;'><div class='tittle'>" +
      graphCollection[i].kannValue +
      "</div><small>" +
      graphCollection[i].columnName +
      "</small></div><div class='col text-info bold' style='text-align: center;'><div class='tittle'>" +
      graphCollection[i].innenValue +
      "</div><small>" +
      graphCollection[i].innenName +
      "</small></div></div></div><div class='cols1 collapse' id='demo" +
      i +
      "'>";
    for (let j = 0; j < graphCollection[i].prgressBarDetail.length; j++) {
      html +=
        "<div><hr /><div class='levelName'><small>" +
        graphCollection[i].prgressBarDetail[j].level +
        "</small></div><p class='titleName'>" +
        graphCollection[i].prgressBarDetail[j].title +
        "</p><div class='progrewithcolps'><div class='progress'><div class='progress-bar bg-success' style='width:40%;'></div></div><a class='expandiconinner collapsed' data-toggle='collapse' data-target='#innerexpand" +
        i +
        j +
        "'><img src='/images/triangle1.png' alt=img'' /></a></div><div class='childprogrewithcolps collapse' id='innerexpand" +
        i +
        j +
        "'><p class='titleName'>Helga Bauer</p><div class='progress progressInner'><div class='progress-bar bg-success' style='width:40%;'></div></div>" +
        "<p class='titleName'>Simone Fischer</p><div class='progress progressInner'><div class='progress-bar bg-success' style='width:40%;'></div></div>" +
        "<p class='titleName'>Lotte Scheller</p><div class='progress progressInner'><div class='progress-bar bg-success' style='width:40%;'></div></div>" +
        "</div></div>";
    }
    html +=
      "</div><a class='expandicon collapsed' data-toggle='collapse' data-target='#demo" +
      i +
      "'><img src='/images/triangle1.png' alt=img'' /></a>";
    card.innerHTML += html;
  }
}