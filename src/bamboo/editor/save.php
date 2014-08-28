<?php

if (isset($_POST['filename']) && isset($_POST['data'])) {
    $dir = '../../../media/';
    $file = $dir . $_POST['filename'];
    $data = $_POST['data'];

    if (file_put_contents($file, $data)) {
        die('success');
    }
}

die('error');