#import "HFOfflineTileOverlay.h"

@implementation HFOfflineTileOverlay

- (instancetype)initWithURLTemplate:(NSString *)URLTemplate cachePath:(NSString *)cachePath {
    self = [super initWithURLTemplate:URLTemplate];
    if (self) {
        // Strip "file://" prefix if present from Expo FileSystem paths
        if ([cachePath hasPrefix:@"file://"]) {
            _cachePath = [cachePath substringFromIndex:7];
        } else {
            _cachePath = cachePath;
        }
    }
    return self;
}

- (void)loadTileAtPath:(MKTileOverlayPath)path result:(void (^)(NSData *data, NSError *error))result {
    if (!self.cachePath) {
        [super loadTileAtPath:path result:result];
        return;
    }

    // Construct path: {cachePath}/{z}/{x}/{y}.png
    NSString *tileFilePath = [NSString stringWithFormat:@"%@/%ld/%ld/%ld.png",
                              self.cachePath, (long)path.z, (long)path.x, (long)path.y];

    if ([[NSFileManager defaultManager] fileExistsAtPath:tileFilePath]) {
        NSError *readError = nil;
        NSData *tileData = [NSData dataWithContentsOfFile:tileFilePath options:0 error:&readError];
        
        if (tileData && !readError) {
            if (self.onTileAccess) {
                self.onTileAccess(tileFilePath, tileData.length);
            }
            result(tileData, nil);
        } else {
            // If file exists but reading fails, fallback to network
            [super loadTileAtPath:path result:result];
        }
    } else {
        // Fallback to MKTileOverlay's default behavior (fetching from URLTemplate)
        [super loadTileAtPath:path result:result];
    }
}

@end