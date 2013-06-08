zurmo-chat
==========

Chat for Zurmo CRM

![Preview](https://raw.github.com/cortezcristian/zurmo-chat/develop/preview/preview2013-06-08-statuses.png)


# Installation

### 1. Copy the chat folder

    $ cp -r chat %zurmo-root%/app/

### 2. Include dependencies

File %zurmo-root%/app/protected/modules/zurmo/views/HeaderView.php

            $horizontalGridView = new GridView(1, 1); 
            $horizontalGridView->setView($globalSearchAndShortcutsCreateMenuView, 0, 0); 
            $this->verticalGridView->setView($horizontalGridView, 1, 0); 
            Yii::app()->clientScript->registerCssFile(Yii::app()->baseUrl.'/chat/css/ui-lightness/jquery-ui-1.8.2.custom.css'); 
            Yii::app()->clientScript->registerCssFile(Yii::app()->baseUrl.'/chat/css/jquery.ui.chatbox.css'); 
            Yii::app()->clientScript->registerScriptFile(Yii::app()->baseUrl.'/chat/javascripts/jquery-ui-1.8.2.custom.min.js'); 
            Yii::app()->clientScript->registerScriptFile(Yii::app()->baseUrl.'/chat/javascripts/jquery.ui.chatbox.js'); 
            Yii::app()->clientScript->registerScriptFile(Yii::app()->baseUrl.'/chat/javascripts/chatboxManager.js'); 
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
                    window.superGlobal = "'. Yii::app()->user->userModel->username .'";
                    jQuery.getScript("'.Yii::app()->baseUrl.'/chat/javascripts/chat.js");                                                                                 
                ');


### 3. Configure Mysql
Change the schema of _user

    ALTER TABLE  `_user` ADD  `isonline` TINYINT( 1 ) NOT NULL DEFAULT  '0'

Add the credentials to the config file

### 4. Start Node
