package com.example.BeaconScanner;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import com.estimote.sdk.Beacon;
import com.estimote.sdk.BeaconManager;
import com.estimote.sdk.Region;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class MainActivity extends AppCompatActivity {
    // Declare Global Variables
    private String serverAddress = "http://45.55.64.92/";

    private static final Map<String, List<String>> PLACES_BY_BEACONS;

    // TODO: replace "<major>:<minor>" strings to match your own beacons.
    static {
        Map<String, List<String>> placesByBeacons = new HashMap<>();
        // handle beacon 1
        placesByBeacons.put("50284:36053", new ArrayList<String>() {{
            add("Region 1");
            // read as: "Region 1" is closest
            add("Region 2");
            // "Region 2" is the next closest
            add("Region 3");
            // "Region 3" is the furthest away
        }});

        // handle beacon 2
        placesByBeacons.put("51124:51456", new ArrayList<String>() {{
            add("Region 1");
            // read as: "Region 1" is closest
            add("Region 2");
            // "Region 2" is the next closest
            add("Region 3");
            // "Region 3" is the furthest away
        }});

        // handle beacon 3
        placesByBeacons.put("59661:7626", new ArrayList<String>() {{
            add("Region 1");
            // read as: "Region 1" is closest
            add("Region 2");
            // "Region 2" is the next closest
            add("Region 3");
            // "Region 3" is the furthest away
        }});
        PLACES_BY_BEACONS = Collections.unmodifiableMap(placesByBeacons);
    }

    private List<String> placesNearBeacon(Beacon beacon) {
        String beaconKey = String.format("%d:%d", beacon.getMajor(), beacon.getMinor());
        if (PLACES_BY_BEACONS.containsKey(beaconKey)) {
            return PLACES_BY_BEACONS.get(beaconKey);
        }
        return Collections.emptyList();
    }

    private BeaconManager beaconManager;
    private Region region1;
    private Region region2;
    private Region region3;
    private Region region4;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        beaconManager = new BeaconManager(this);
        beaconManager.setRangingListener(new BeaconManager.RangingListener() {
            @Override
            public void onBeaconsDiscovered(Region region, List<Beacon> list) {
                if (!list.isEmpty()) {
                    Beacon nearestBeacon = list.get(0);
                    List<String> places = placesNearBeacon(nearestBeacon);
                    // TODO: update the UI here
                    Log.d("Beacon Found. ", "Nearest region: " + places);
                }
            }
        });
        region1 = new Region("Region 1", UUID.fromString("B9407F30-F5F8-466E-AFF9-25556B57FE6D"), null, null);
        region2 = new Region("Region 2", UUID.fromString("B9407F30-F5F8-466E-AFF9-25556B57FE6D"), null, null);
        region3 = new Region("Region 3", UUID.fromString("B9407F30-F5F8-466E-AFF9-25556B57FE6D"), null, null);
        region4 = new Region("Region 4", UUID.fromString("B9407F30-F5F8-466E-AFF9-25556B57FE6D"), null, null);
    }

    /*@Override
    protected void onResume() {
        super.onResume();

        SystemRequirementsChecker.checkWithDefaultDialogs(this);

        beaconManager.connect(new BeaconManager.ServiceReadyCallback() {
            @Override
            public void onServiceReady() {
                beaconManager.startRanging(region);
            }
        });
    }

    @Override
    protected void onPause() {
        beaconManager.stopRanging(region);

        super.onPause();
    }*/

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    public void sendMessageToServer(final Region region)
    {
        Log.i("Sending to server... ","URL: " + serverAddress);
    }
}
