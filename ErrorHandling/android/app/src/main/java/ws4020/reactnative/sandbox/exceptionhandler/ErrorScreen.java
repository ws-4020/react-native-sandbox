package ws4020.reactnative.sandbox.exceptionhandler;

import android.app.Activity;
import android.os.Bundle;

import ws4020.reactnative.sandbox.R;

public class ErrorScreen extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.error_screen);
    }
}
