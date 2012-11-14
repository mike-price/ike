/*!
 * ike HTML5,CSS3,Javascript Robot
 *
 * Runs on jQuery
 * http://jquery.com/
 *
 *
 * Copyright 2012 Michael Price
 *
 * Date: 11/14/2012
 */

//ike type-a v0.1 library
//jQuery plugin that powers ike the html robot
(function( $ ) 
{
    var meths = {};

    var _protected = {};
    var _commands = {};
    var _instructions = {};

    _protected.map = {};

    _protected.b_class = ""; //broswer class used for transformations

    _protected.schema = {};

    _instructions.wave = {};


     _protected.rotate = function(el,deg,component)
    {
      $this = $(this);
      el.css(_protected.b_class+'transform', 'rotate('+deg+'deg)');

      var _state = {};
      
      _state["rotate-"+component]={el: el, fn:'rotate',val:deg+"deg"};
       
       var data = $this.data('ike');

       $.extend(data,_state);
       
       $this.data('ike',data);

       _protected.setState.apply($this);
    }

    _protected.scale = function(el,val)
    {
      el.css(_protected.b_class+'transform', 'scale('+val+')');
    }

     _protected.moveX = function(el,val)
    {
     el.css(_protected.b_class+'transform', 'translate('+val+'px, 0px)'); 
    }

    _protected.moveY = function(el,val)
    {
     el.css(_protected.b_class+'transform', 'translate(0px, '+val+'px)'); 
    }

    _protected.moveXY = function(el,ob,command)
    {
      $this = $(this);

       el.css(_protected.b_class+'transform', 'translate('+ob.x+'px, '+ob.y+'px)'); 
       
       var _state = {};

       _state["moveXY-"+command]={el: el, fn:'translate',val:ob.x+"px, "+ob.y+"px"};

       var data = $this.data('ike');

       $.extend(data,_state);
       
       $this.data('ike',data);

       _protected.setState.apply($this);
       
    }

    _protected.setTime = function(el,time)
    {
      el.css(_protected.b_class+'transition','All '+time+'s ease')
    }

    _protected.setState = function()
    {
      /*
       $this = $(this);

       var data = $this.data('ike');

       if(data)
       {
          $.each(data,function(idx,obj)
          {
            if(obj.el)
            {

              obj.el.css(_protected.b_class+'transform',obj.fn+'('+obj.val+')')
            }
          });
       }*/ 
    }

    _protected.build = function()
    {
      console.log('building...');

      $this = $(this);

      $this.hide();

      $.getJSON('config/schema.json',function(_data)
      {
          var _schema = _data;

          _protected.schema = _data;

          $this.css("height",_schema.height);
          $this.css("width",_schema.width);
          
         $.each(_schema.components,function(i,_c)
          {
              _c.manifest = $('<'+_c._type+' />');

              _c.manifest.addClass(_c._class);

              if(_c.components)
                _protected.build_component.apply($this,[_c.manifest,_c.components])

              $this.append(_c.manifest);
          }); 

         $this.fadeIn();
         //_protected.scale.apply($this,[$this,".5"]);
         $this.find('p.speech').hide();
      }).error(function()
      {
        console.log('error loading robo schema!');
      })
    }

    _protected.build_component = function(el,data)
    {

        $this = $(this);

        $.each(data,function(i,_c)
        {
            _c.manifest = $('<'+_c._type+' />');

            _c.manifest.addClass(_c._class);

            if(_c.components)
              _protected.build_component.apply($this,[_c.manifest,_c.components])

            el.append(_c.manifest);
        }); 
    }

    _protected.say = function(el, options)
    {
        var $this = $(this);

        if(!options || options == null || options == "")
        {
          el.html(options);
          el.closest('p.speech').slideUp();
          _protected.moveY.apply($this, [el, "40"]);
          return;
        }

        el.html(options);//.css('font-weight','bold');

        _protected.scale.apply($this,[el,'1.03']);

        setTimeout(function()
        {
           _protected.scale.apply($this,[el,'1']);
        },500)

        $this.find('p.speech:hidden').slideDown();

        _protected.moveY.apply($this, [$this, "-40"]);
    }


    //process specific commands
    _protected.process = function(cmd)
    {
      var $this = $(this);

      $.getJSON('commands/'+cmd+'.json',function(_data)
      {
        $.each(_data.commands,function(i,commandset)
        {
            setTimeout(function()
            {
               $.each(commandset.params,function(key,command)
                {
                    var frame = $this.find(_protected.map[command.frame]);

                    _protected.setTime(frame, commandset.time);
                    
                    _protected[commandset.action].apply($this, [frame, command.value,command.frame]);
                });

            },i == 0 ? 0 : (commandset.time*i)*_data.speed); 
        });
      }).error(function()
      {
         console.log("I don't know that.");
         _protected.process.apply($this,['shrug']);
      });
    }

    _protected.init_speech = function()
    {
        $this = $(this);

        $this.find('input.speech-input').onfocus = $this.find('input.speech-input').blur;

        
        $this.find('input.speech-input').live('webkitspeechchange',function(el,ev)
        {
            var command = $this.find('input.speech-input').val();
            var commands = command.split(" ");

            console.log(commands)

            if(commands[0] == _protected.schema['speech-to-text-command'] || commands[0] == 'hey')
            {
              commands = commands.splice(1).join(' ');
              console.log(commands)
              _protected.say.apply($this, [$(_protected.map['speech-box']),commands]);
            }
            else
            {
              $.each(commands,function(i,_c)
              {
                  _protected.process.apply($this,[_c]);
              });
            }
        });
    }

    meths.init = function(options)
    {
      switch(true)
      {
        case $.browser.webkit:
          _protected.b_class = "-webkit-";
        break;
        case $.browser.mozilla:
          _protected.b_class = "-moz-";
        break;
        case $.browser.opera:
          _protected.b_class = "-o-";
        break;
        case $.browser.msie:
          _protected.b_class = '-ms-';
        break
      }

      $.getJSON('config/map.json', function(_data)
      {
        _protected.map = _data;
      }).error(function()
      {
        console.log('map config not set')
      });

    	return this.each(function()
    	{
    		console.log('robot intialized!');

    		var $this = $(this);
        
        _protected.build.apply($this);

        _protected.init_speech.apply($this);

        var data = $this.data('ike');
            
        if(!data) 
        {
          $this.data('ike', 
          {
            target : $this
          });
        }

        setTimeout(function()
        {
            $this.find('input.speech-input').trigger('click');
            
        },1000);

    	});
    }

    meths.destroy = function()
    {

    }

    meths.wave = function()
    {
      var commands = {};


      return this.each(function()
      {
        var $this = $(this);

        _protected.process.apply($this, ['wave']);
      });
      
    }

    meths.say = function(options)
    {
      return this.each(function()
      {
          var $this = $(this);

          _protected.say.apply($this,[$this.find('span.speech-text'),options]);
      });
    }

    meths.command=function(commands,options)
    {
      var args = Array.prototype.slice.call( arguments, 1 );

      return this.each(function()
      {
        var $this = $(this);

        if(typeof commands === 'string')
        {
          if(_commands[commands])
          {
             options = args[0].slice();

             _commands[commands].apply($this, [options[i]]);
          }
          else
          {
               _protected.process.apply($this,[commands]);
          }
        }
        else
        {
          $.each(commands,function(i,command)
          {
            if(_commands[command])
            {
              options = args[0].slice();

              _commands[command].apply($this, [options[i]]);
            }
            else
            {
               _protected.process.apply($this,[command]);
            }
          });
        }
        
          
      });
    }
    _commands['move-left-arm']=function(options)
    {
      var arm = this.find(_protected.map['arm-l-0']);

      _protected.setTime(arm, options.time ? options.time : '1');

      _protected.rotate(arm,options.rotate);
      
      setTimeout(function()
      {
        _protected.rotate(arm,"0");
      },options.time ? options.time*1000 : 1000)
    }

    _commands['bend-left-arm']=function(options)
    {
      var arm = this.find(_protected.map['arm-l-1']);

       _protected.setTime(arm, options.time ? options.time : '1');

      _protected.rotate(arm,options.rotate);
    
      setTimeout(function()
      {
        _protected.rotate(arm,"0");
      },options.time ? options.time*1000 : 1000)
    }

   

    $.fn.ike = function( options ) 
    {
    
      	var settings = $.extend({
      		"name" : "Ike",
      		"pose":
      		{
      			"arm-l-0": "0",
  	    		"arm-l-1": "0",
  	    		"arm-r-0": "0",
  	    		"arm-r-1": "0",
  	    		"leg-l-0": "0",
  	    		"leg-r-0": "0"
      		},
      		"style":
      		{
      			"eye-color":"#5676ce",
      			"shoulder-color":"",
  				"elbow-color":"#5676ce",
  				"hand color":"#5676ce"

      		},
      		"commands":{}
      		
      	},options);


      if ( meths[options] ) 
      {
        return meths[options].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } 
      else 
      if ( typeof options === 'object' || ! options ) 
      {
        return meths.init.apply( this, arguments );
      } 
      else 
      {
        $.error( 'Method ' +  options + ' does not exist on jQuery.ike.typa1' );
      }    
    };

})( jQuery );