<?php
/*
Uploadify
Copyright (c) 2012 Reactive Apps, Ronnie Garcia
Released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/

// Define a destination
$targetFolder = 'uploads'; // Relative to the root

$tempFile = $_FILES['Filedata']['tmp_name'];
$targetFile = $targetFolder . '/' . $_FILES['Filedata']['name'];

// Validate the file type
$fileTypes = array('jpg','jpeg','gif','png'); // File extensions
$fileParts = pathinfo($_FILES['Filedata']['name']);

if (in_array($fileParts['extension'], $fileTypes)) {	//符合格式
	echo $targetFile;

	move_uploaded_file($tempFile, $targetFile);

	echo json_encode(Array('success' => true, 'fileid' => 1));
} else {
	echo json_encode(Array('success' => false, 'msg' => '文件类型不符'));
}
?>