package com.errorhandling.exceptionhandler;

import android.app.Activity;
import android.os.Bundle;

import com.errorhandling.R;

public class ErrorScreen extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.error_screen);
    }
}
