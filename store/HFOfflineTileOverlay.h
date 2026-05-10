#import <MapKit/MapKit.h>

typedef void (^HFOfflineTileAccessBlock)(NSString *tilePath, NSUInteger size);

@interface HFOfflineTileOverlay : MKTileOverlay

@property (nonatomic, copy) NSString *cachePath;
@property (nonatomic, copy) HFOfflineTileAccessBlock onTileAccess;

- (instancetype)initWithURLTemplate:(NSString *)URLTemplate cachePath:(NSString *)cachePath;

@end