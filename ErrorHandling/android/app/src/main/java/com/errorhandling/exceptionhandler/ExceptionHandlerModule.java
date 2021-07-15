package com.errorhandling.exceptionhandler;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

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
        // 現在設定されている UncaughtExceptionHandlerを退避
        final Thread.UncaughtExceptionHandler originalUncaughtExceptionHandler = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {

            private volatile boolean crashed = false;

            @Override
            public void uncaughtException(Thread thread, Throwable throwable) {
                Log.d("ExceptionHandlerModule", "Caught exception.", throwable);
                try {
                    if (!crashed) {
                        crashed = true;
                        Activity activity = getCurrentActivity();

                        Intent i = new Intent();
                        i.setClass(activity, ErrorScreen.class);
                        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                        // ActivityはNullにはならない想定
                        if (activity != null) {
                            activity.startActivity(i);
                            // React Nativeが生成しているActivityを終了させる（AndroidのOSの戻るボタンで戻れなくする対応）
                            activity.finish();
                        }

                        // もともと設定されているハンドラを実行すると、アプリが強制終了してしまうので呼びださない。
                        // originalUncaughtExceptionHandler.uncaughtException(thread, throwable);
                    }
                } catch (Exception e) {
                    Log.d("ExceptionHandlerModule", "Error occurred in handling uncaught exception.", e);
                }
            }
        });
    }
}