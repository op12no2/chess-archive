
/*{{{  fold marker*/

/*}}}*/

table.on("tableBuilt", () => {

  const params = new URLSearchParams(window.location.search);

  /*{{{  sortcol=<col> sortdir=<dir>*/
  
  const sortcol = params.get("sortcol");
  
  if (sortcol) {
    const sortdir = params.get("sortdir") || "desc";
    table.setSort([{ column: sortcol, dir: sortdir }]);
  }
  
  /*}}}*/
  /*{{{  msg=<text>*/
  
  let msg = params.get("msg");
  
  if (msg) {
    const el = document.getElementById("userdesc");
    if (el) {
      el.textContent = msg;
      el.removeAttribute("href");
    }
  }
  
  /*}}}*/
  /*{{{  hidetagcols*/
  
  if (params.get("hidetagcols")) {
    for (const field of tagList) {
      const column = table.getColumn(field);
      if (column)
        column.hide();
    }
  }
  
  /*}}}*/
  /*{{{  hideratcols*/
  
  if (params.get("hideratcols")) {
    for (const field of ratList) {
      const column = table.getColumn(field);
      if (column)
        column.hide();
    }
  }
  
  /*}}}*/

  params.forEach((val, key) => {
    /*{{{  additive params*/
    
    key = key.trim();
    val = val.trim();
    
    /*{{{  hidecol=<col>*/
    
    if (key == "hidecol") {
      const column = table.getColumn(val);
      if (column)
        column.hide();
    }
    
    /*}}}*/
    /*{{{  showcol=<col>*/
    
    if (key == "showcol") {
      const column = table.getColumn(val);
      if (column)
        column.show();
    }
    
    /*}}}*/
    /*{{{  filter_<col>=<filter>*/
    
    if (key.startsWith("filter_")) {
    
      const field  = key.slice(7);
      const op1    = val.slice(0, 1);
      const op2    = val.slice(0, 2);
      const isRat  = ratSet.has(field);
      const column = table.getColumn(field);
    
      if (column) {
    
        const def = column.getDefinition();
    
        if (isRat) {
          /*{{{  rat column*/
          
          if (op2 == '!=') {
            const n = Number(val.slice(2));
            table.addFilter(field, "!=", n);
          }
          else if (op2 == '==') {
            const n = Number(val.slice(2));
            table.addFilter(field, "=", n);
          }
          else if (op2 == '>=') {
            const n = Number(val.slice(2));
            table.addFilter(field, ">=", n);
          }
          else if (op2 == '<=') {
            const n = Number(val.slice(2));
            table.addFilter(field, "<=", n);
          }
          
          else if (op1 == '=') {
            const n = Number(val.slice(1));
            table.addFilter(field, "=", n);
          }
          else if (op1 == '>') {
            const n = Number(val.slice(1));
            table.addFilter(field, ">", n);
          }
          else if (op1 == '<') {
            const n = Number(val.slice(1));
            table.addFilter(field, "<", n);
          }
          
          /*}}}*/
        }
        else {
          /*{{{  tag column*/
          
          if (op2 == '!=') {
            const s = val.slice(2);
            table.addFilter(field, "!=", s);
          }
          else if (op2 == '==') {
            const s = val.slice(2);
            table.addFilter(field, "=", s);
          }
          else if (op1 == '=') {
            const s = val.slice(1);
            table.addFilter(field, "=", s);
          }
          else if (op1 == '^') {
            const s = val.slice(1);
            table.addFilter(field, "starts", s);
          }
          else if (op1 == '$') {
            const s = val.slice(1);
            table.addFilter(field, "ends", s);
          }
          else if (op1 == '!') {
            const s = val.slice(1);
            table.addFilter(field, "notlike", s);
          }
          else {
            const s = val;
            table.addFilter(field, "like", s);
          }
          
          /*}}}*/
        }
      }
    }
    
    /*}}}*/
    
    /*}}}*/
  });

});

