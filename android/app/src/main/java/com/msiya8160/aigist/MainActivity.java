/*
 * Fork modification notice (AGPL v3.0 Section 5a):
 * Modified by 兔叽 (msiya8160-star) on 2026-10-21
 * Change: Package name changed to com.msiya8160.aigist
 * Original project: AI Gist by Yarin Zhang (https://github.com/yarin-zhang/AI-Gist)
 */

package com.msiya8160.aigist;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WebDavPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
