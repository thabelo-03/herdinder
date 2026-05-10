#import <React/RCTViewManager.h>
#import <React/RCTBridge.h>
#import <React/RCTLog.h>
#import <React/RCTEventDispatcher.h>
#import <MapKit/MapKit.h>
#import "HFOfflineTileOverlay.h"
#import "AIRMap.h"
#import "AIRMapUrlTile.h"

@interface HFOfflineTileOverlayManager : RCTViewManager
@end

@implementation HFOfflineTileOverlayManager

RCT_EXPORT_MODULE(OfflineTileOverlay)

- (UIView *)view {
    // We use AIRMapUrlTile as a base because react-native-maps knows how to
    // handle it as an overlay child of the MapView.
    return [AIRMapUrlTile new];
}

RCT_CUSTOM_PROPERTY(urlTemplate, NSString, AIRMapUrlTile) {
    view.urlTemplate = json;
    [self updateOverlay:view];
}

RCT_CUSTOM_PROPERTY(cachePath, NSString, AIRMapUrlTile) {
    // We store the cachePath in the accessibilityHint or a custom property 
    // if we were to subclass AIRMapUrlTile. For this implementation, 
    // we'll trigger the overlay update.
    RCTLogInfo(@"[OfflineTileOverlay] cachePath received from JS: %@", json);
    view.accessibilityHint = json; 
    [self updateOverlay:view];
}

RCT_EXPORT_VIEW_PROPERTY(maximumZ, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(zIndex, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(tileSize, NSInteger)

- (void)updateOverlay:(AIRMapUrlTile *)view {
    if (view.urlTemplate && view.accessibilityHint) {
        RCTLogInfo(@"[OfflineTileOverlay] Initializing overlay. URL: %@, Path: %@", view.urlTemplate, view.accessibilityHint);
        
        HFOfflineTileOverlay *overlay = [[HFOfflineTileOverlay alloc] initWithURLTemplate:view.urlTemplate 
                                                                              cachePath:view.accessibilityHint];
        overlay.canReplaceMapContent = NO;

        __weak HFOfflineTileOverlayManager *weakSelf = self;
        overlay.onTileAccess = ^(NSString *tilePath, NSUInteger size) {
            // Notify JS thread via the bridge
            NSString *uri = [NSString stringWithFormat:@"file://%@", tilePath];
            [weakSelf.bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                                    method:@"emit"
                                      args:@[@"onTileAccess", @{@"uri": uri, @"size": @(size)}]];
        };
        
        if (view.tileSize > 0) {
            overlay.tileSize = CGSizeMake(view.tileSize, view.tileSize);
        }
        
        // Assign the custom overlay back to the view
        view.tileOverlay = overlay;
    }
}

@end