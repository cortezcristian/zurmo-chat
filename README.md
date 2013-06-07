zurmo-chat
==========

Chat for Zurmo CRM

# Installation

### 1. Copy the chat folder

    $ cp -r chat %zurmo-root%/app/

### 2. Include dependencies

File %zurmo-root%/app/protected/modules/zurmo/views/HeaderView.php

    Yii::app()->clientScript->registerScriptFile('./chat/javascripts/jquery-ui-1.8.2.custom.min.js'); 
    Yii::app()->clientScript->registerScriptFile('./chat/javascripts/jquery.ui.chatbox.js'); 
    Yii::app()->clientScript->registerScriptFile('./chat/javascripts/chatboxManager.js'); 
    Yii::app()->clientScript->registerScriptFile('http://localhost:3200/socket.io/socket.io.js'); 
    if (Yii::app()->user->loginRequiredAjaxResponse)
    {
        Yii::app()->clientScript->registerScript('ajaxLoginRequired', '
            jQuery("body").ajaxSuccess(
                function(event, request, options)
                {
                    if (request.responseText == "' . Yii::app()->user->loginRequiredAjaxResponse . '")
                    {
                        window.location.reload(true);
                    }
                }
            );
            var superGlobal = "'. Yii::app()->user->userModel->username .'";
            jQuery.getScript("./chat/javascripts/chat.js");
        ');
    }

### 3. Start Node
