#include <stdio.h>
#include <math.h>

#define TOTAL_COINS 21

typedef struct {
    float x, y;      // position
    float radius;    // radius of coin
    float vx, vy;    // velocity
    char type;       // B = black, W = white, R = red
} Coin;

Coin coins[TOTAL_COINS];

void initializeCoins() {
    float centerX = 0.0f;
    float centerY = 0.0f;
    float r = 1.0f;

    int index = 0;

    // Red coin in center
    coins[index++] = (Coin){centerX, centerY, r, 0.0f, 0.0f, 'R'};

    // First ring: 6 coins (3 black, 3 white)
    float offset1 = 2.2f;
    for (int i = 0; i < 6; i++) {
        float angle = i * 60.0f * M_PI / 180.0f;

        coins[index++] = (Coin){
            centerX + offset1 * cos(angle),
            centerY + offset1 * sin(angle),
            r,
            0.0f,
            0.0f,
            (i % 2 == 0) ? 'B' : 'W'
        };
    }

    // Second ring: 14 coins (7 black, 7 white)
    float offset2 = 4.4f;
    for (int i = 0; i < 14; i++) {
        float angle = i * (360.0f / 14.0f) * M_PI / 180.0f;

        coins[index++] = (Coin){
            centerX + offset2 * cos(angle),
            centerY + offset2 * sin(angle),
            r,
            0.0f,
            0.0f,
            (i % 2 == 0) ? 'W' : 'B'
        };
    }
}

void printCoins() {
    for (int i = 0; i < TOTAL_COINS; i++) {
        printf("Coin %2d: %c | Pos(%.2f, %.2f) | Vel(%.2f, %.2f)\n",
               i,
               coins[i].type,
               coins[i].x,
               coins[i].y,
               coins[i].vx,
               coins[i].vy);
    }
}

int main() {
    initializeCoins();
    printCoins();
    return 0;
}