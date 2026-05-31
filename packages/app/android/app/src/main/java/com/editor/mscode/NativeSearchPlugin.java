package com.editor.mscode;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@CapacitorPlugin(name = "NativeSearch")
public class NativeSearchPlugin extends Plugin {

    private int totalMatches = 0;
    private static final int MAX_MATCHES = 2000;

    @PluginMethod
    public void search(PluginCall call) {
        String basePath = call.getString("basePath");
        String query = call.getString("query");
        boolean isRegex = Boolean.TRUE.equals(call.getBoolean("isRegex"));
        boolean matchCase = Boolean.TRUE.equals(call.getBoolean("matchCase"));
        boolean wholeWord = Boolean.TRUE.equals(call.getBoolean("wholeWord"));

        // Getting Dynamic Api from Frontend
        JSArray ignoreDirsArray = call.getArray("ignoreDirs", new JSArray());
        JSArray ignoreExtsArray = call.getArray("ignoreExtensions", new JSArray());

        List<String> ignoreDirs = new ArrayList<>();
        try {
            for (int i = 0; i < ignoreDirsArray.length(); i++) {
                ignoreDirs.add(ignoreDirsArray.getString(i));
            }
        } catch (Exception ignored) {}

        List<String> ignoreExts = new ArrayList<>();
        try {
            for (int i = 0; i < ignoreExtsArray.length(); i++) {
                ignoreExts.add(ignoreExtsArray.getString(i).toLowerCase());
            }
        } catch (Exception ignored) {}

        if (basePath == null || query == null || query.isEmpty()) {
            call.resolve(new JSObject().put("results", new JSArray()));
            return;
        }

        new Thread(() -> {
            try {
                String regexPattern = query;
                if (!isRegex) {
                    regexPattern = Pattern.quote(query);
                }
                if (wholeWord) {
                    regexPattern = "\\b" + regexPattern + "\\b";
                }

                int flags = 0;
                if (!matchCase) {
                    flags |= Pattern.CASE_INSENSITIVE;
                }

                Pattern pattern = Pattern.compile(regexPattern, flags);
                JSArray results = new JSArray();
                totalMatches = 0;

                File rootDir = new File(basePath);
                if (rootDir.exists() && rootDir.isDirectory()) {
                    // Passing Dynamic List
                    searchRecursive(rootDir, basePath, pattern, results, ignoreDirs, ignoreExts);
                }

                JSObject ret = new JSObject();
                ret.put("results", results);
                call.resolve(ret);

            } catch (Exception e) {
                call.reject("Search failed", e);
            }
        }).start();
    }

    private void searchRecursive(File dir, String rootPath, Pattern pattern, JSArray results, List<String> ignoreDirs, List<String> ignoreExts) {
        if (totalMatches >= MAX_MATCHES) return;

        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                // Dynamic Folder Skipping
                if (!ignoreDirs.contains(file.getName())) {
                    searchRecursive(file, rootPath, pattern, results, ignoreDirs, ignoreExts);
                }
            } else {
                searchInFile(file, rootPath, pattern, results, ignoreExts);
            }
        }
    }

    private void searchInFile(File file, String rootPath, Pattern pattern, JSArray results, List<String> ignoreExts) {
        String name = file.getName().toLowerCase();
        
        // Dynamic Extension Skipping (Image, Binary etc.)
        for (String ext : ignoreExts) {
            if (name.endsWith(ext)) return;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            int lineNumber = 1;
            JSArray fileMatches = new JSArray();

            while ((line = reader.readLine()) != null) {
                Matcher matcher = pattern.matcher(line);
                while (matcher.find()) {
                    JSObject match = new JSObject();
                    match.put("id", UUID.randomUUID().toString());
                    match.put("line", lineNumber);
                    match.put("column", matcher.start() + 1);
                    match.put("matchStart", matcher.start());
                    match.put("matchLength", matcher.end() - matcher.start());
                    
                    String preview = line.length() > 150 ? line.substring(0, 150) + "..." : line;
                    match.put("preview", preview);

                    fileMatches.put(match);
                    totalMatches++;
                    if (totalMatches >= MAX_MATCHES) break;
                }
                if (totalMatches >= MAX_MATCHES) break;
                lineNumber++;
            }

            if (fileMatches.length() > 0) {
                JSObject fileResult = new JSObject();
                fileResult.put("filePath", file.getAbsolutePath());
                fileResult.put("fileName", file.getName());
                
                String dirPath = file.getParentFile().getAbsolutePath().replace(rootPath, "~");
                if (dirPath.equals(rootPath)) dirPath = "~";
                
                fileResult.put("dirPath", dirPath);
                fileResult.put("expanded", true);
                fileResult.put("matches", fileMatches);

                results.put(fileResult);
            }
        } catch (Exception ignored) {}
    }
}