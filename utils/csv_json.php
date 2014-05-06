<?php
$fhandle = fopen('base-path-to-data/NHS winter watch/john ranking test/ranked_list_ae_trusts_ALL_WEEKS.csv','r');
$rowIndex = 1;
$dataset = array();
while(($data = fgetcsv($fhandle, 0, ',')) !== false) {
    if ($rowIndex > 1) {
        $dataset[] = array($data[1], $data[2], round($data[4]), round($data[7], 1));
    }
    $rowIndex++;
}
file_put_contents(dirname(__FILE__) . '/../source/js/dataset.js', 'define(function(){return' . json_encode($dataset) . '});');