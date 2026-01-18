# Elox

Experimental.

Scrape and render chess engine ratings across multiple sites.

View scraped ratings: https://op12no2.github.io/elox/

```Ctrl+Click``` or ```Shift+Click``` column headings for secondary sort. 

Use column entry boxes to filter (case-insensitive).

Raw data is scraped to ```data.js``` and redered via ```index.htm```, both of which are created by ```update.js```.

Elox auto-updates at ~0900 UCT every day via the ```build-index.yml``` github action, which can also be run manually.

Alternatively run off-line and upload files using:-

```
node update.js
```

While there are some sorting and filter solutions available via the UI, Elox is intended to be driven by URL parameters via a saved browser link for example.

## URL parameters

### Column identifiers

Current _tag_ column identifiers, derived from ```tags.js```, are:-

- ```engine```
- ```lang```
- ```search```
- ```eval```
- ```misc```

Current _rating_ column identifiers derived from ```sites.js```, are:-

- ```ccrl40154``` CCRL 40/15 4 threads
- ```ccrl4015``` CCRL 40/15 1 thread
- ```ccrlblitz8``` CCRL Blitz 8 threads
- ```ccrlblitz``` CCRL Blitz 1 thread
- ```ccrlfrc``` CCRL FRC 1 thread
- ```pohl15``` SPCC Top 15 1 thread
- ```pohleas``` SPCC EAS 1 thread
- ```ip101``` Ipman 10+1 1 thread
- ```rbb324``` Chess 324 Top 15 Round Robin 1 thread (managed by RBB)
 
### Singlular parameters

These are applied once. The first takes precedence if one appears more than once.

#### sortcol=\<col>

Sort on the specified column (identifier). The default sort column is ```ccrl40154```. 

- https://op12no2.github.io/elox?sortcol=rbb324

#### sortdir=asc|desc

The default sort direction is descending (````desc````).

- https://op12no2.github.io/elox?sortcol=engine&sortdir=asc

#### msg=\<string>

Replace the title at the top of the page with \<string>

- https://op12no2.github.io/elox?msg=hello%20world

#### hidetagcols

Hide all tag columns.

- https://op12no2.github.io/elox?hidetagcols=1

#### hideratcols

Hide all rating columns.

- https://op12no2.github.io/elox?hideratcols=1

### Plural parameters

These can appear more than once and are interpreted with _and_.

#### hidecol=\<col>

Hide the specified column.

- https://op12no2.github.io/elox?hidecol=misc

#### showcol=\<col>

Show the specified column. 

- https://op12no2.github.io/elox?hideratcols=1&showcol=ccrl40154&showcol=ccrlblitz8

#### filter_\<tag col>=[\<operator>]\<string>

Filter the specificed tag column based on the operator and the string.

When the operator is not present, the filter is interpreted as _containing_ and is case-insensitive.

Operators are:-

- ```!``` Not containing. Case insensitive.
- ```=``` or ```==``` Equal to. Case sensitive.
- ```!=``` Not equal to. Case sensitive.
- ```^``` Starts with. Case insensitive.
- ```$``` Ends with. Case insensitive.

Examples:-

- https://op12no2.github.io/elox?filter_lang=zig&msg=Zig%20Engines
- https://op12no2.github.io/elox?sortcol=lang&filter_lang=!c%2B%2B&msg=Engines%20written%20in%20a%20language%20other%20then%20C%2B%2B
- https://op12no2.github.io/elox?filter_search=mcts&sortcol=ccrl4015
- https://op12no2.github.io/elox?filter_eval=hce&sortcol=ccrl4015
- https://op12no2.github.io/elox?filter_misc=4k&sortcol=ccrl4015
- https://op12no2.github.io/elox?filter_misc=!clone

#### filter_\<rating col>=[\<operator>]\<string>

Filter the specificed rating column based on the operator and the string.

Operators are:-

- ```=``` or ```==``` Equal to.
- ```!=``` Not equal to.
- ```>``` Greater than.
- ```>=``` Greater than or equal to.
- ```<``` Less then.
- ```<=``` Less then or equal to.

Examples:-

- https://op12no2.github.io/elox?filter_ccrlblitz=>3500&filter_eval=h
- https://op12no2.github.io/elox?sortcol=ccrl40154&filter_ccrl40154=>=3600&msg=Purples
- https://op12no2.github.io/elox?sortcol=rbb324&filter_rbb324=>0&msg=Sorted+on+RBB's%20Chess%20324%20Top%2015%20Round%20Robin

### ToDo

- Add the 2 regularly updated CEGT lists.
- Extend the rating column filters to include the auto-rank column, to get top 10 etc.
- Secondary (etc) sorts via url.
- List of strings with 'like' filter for tag columns. 
- Ability to set column width and display rating as progress bar.
- 
   
