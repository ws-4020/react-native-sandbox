package com.errorhandling;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import android.util.Log;
import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ExceptionHandlerModule extends ReactContextBaseJavaModule {
  ExceptionHandlerModule(ReactApplicationContext context) {
      super(context);
   }

  @Override
  public String getName() {
    return "ExceptionHandlerModule";
  }
  @ReactMethod
  public void handle() {
    Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {

      @Override
      public void uncaughtException(Thread thread, Throwable throwable) {
          Log.d("ExceptionHandlerModule", "Caught exception.");
          Activity activity = getCurrentActivity();

          Intent i = new Intent();
          i.setClass(activity, ErrorScreen.class);
          i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

          activity.startActivity(i);
          // TODO finish呼ばなかったらどうなるのか検証する
          activity.finish();
      }
    });
  }
}