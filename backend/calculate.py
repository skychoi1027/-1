# calculate.py (로컬 최종 - Stdin 버전)
import os
# 텐서플로우 로그 끄기 (가장 중요)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import sys
import json
import numpy as np
import io

# 윈도우 콘솔 인코딩 문제 해결 (한글 깨짐 방지)
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

# ---------------------------------------------------------
# 1. 모델 로드
# ---------------------------------------------------------
try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.metrics import MeanSquaredError
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sky_path = os.path.join(base_dir, 'sky3000.h5')
    earth_path = os.path.join(base_dir, 'earth3000.h5')
    
    model_sky = load_model(sky_path, custom_objects={'mse': MeanSquaredError})
    model_earth = load_model(earth_path, custom_objects={'mse': MeanSquaredError})
except Exception as e:
    # 로드 실패 로그는 stderr로 보냄 (Node.js가 무시함)
    print(f"Model Load Error: {e}", file=sys.stderr)
    model_sky = None
    model_earth = None

def calculate_ai_score(t0, t1, type='sky'):
    if (type == 'sky' and model_sky is None) or (type == 'earth' and model_earth is None):
        return 50.0 # 모델 없으면 50점
    
    try:
        nb_classes = 10 if type == 'sky' else 12
        model = model_sky if type == 'sky' else model_earth
        
        idx0 = int(t0) - 1
        idx1 = int(t1) - 1
        
        if idx0 < 0: idx0 = 0
        if idx1 < 0: idx1 = 0
        if idx0 >= nb_classes: idx0 = nb_classes - 1
        if idx1 >= nb_classes: idx1 = nb_classes - 1
        
        vec0 = np.eye(nb_classes)[np.array(idx0).reshape(-1)].flatten()
        vec1 = np.eye(nb_classes)[np.array(idx1).reshape(-1)].flatten()
        input_vec = np.concatenate((vec0, vec1)).reshape(1, -1)
        
        pred = model.predict(input_vec, verbose=0)
        return float(pred[0][0]) * 50 # 50점 만점 환산
    except:
        return 50.0

# ---------------------------------------------------------
# 2. 살(Sal) 계산 로직
# ---------------------------------------------------------
p1, p11 = 8, 9.5
p2, p21 = 7, 8.2
p3, p31 = 6, 7.2
p41, p42, p43 = 10, 8, 6
p5, p6 = 8, 8
p7, p71 = 0, 10
p8, p81, p82, p83 = 0, 10, 6, 4

def calculate_sal_logic(token0, token1, gender0, gender1, score):
    # 데이터 형변환 (안전장치)
    try:
        token0 = [int(x) for x in token0]
        token1 = [int(x) for x in token1]
        gender0 = int(gender0)
        gender1 = int(gender1)
    except:
        pass

    a1, a2, a3 = token0[1], token0[3], token0[5]
    b1, b2, b3 = token1[1], token1[3], token1[5]
    
    # [백호/괴강/성별특수용 데이터]
    t0_y, t0_m, t0_d = token0[0], token0[2], token0[4]
    t1_y, t1_m, t1_d = token1[0], token1[2], token1[4]

    sal0 = [0]*8
    sal1 = [0]*8

    # [1] 삼형살
    if a3==3 and (a1 in [6,9] or a2 in [6,9]): val=p1 if gender0 else p11; score-=val; sal0[0]+=val
    if a3==7 and (a1 in [2,5,7] or a2 in [2,5,7]): val=p1 if gender0 else p11; score-=val; sal0[0]+=val
    if a3==2 and (a1 in [7,8,11] or a2 in [7,8,11]): val=p1 if gender0 else p11; score-=val; sal0[0]+=val
    if b3==3 and (b1 in [6,9] or b2 in [6,9]): val=p1 if gender1 else p11; score-=val; sal1[0]+=val
    if b3==7 and (b1 in [2,5,7] or b2 in [2,5,7]): val=p1 if gender1 else p11; score-=val; sal1[0]+=val
    if b3==2 and (b1 in [7,8,11] or b2 in [7,8,11]): val=p1 if gender1 else p11; score-=val; sal1[0]+=val

    # [2] 원진살
    val0_p2 = p2 if gender0 else p21
    val1_p2 = p2 if gender1 else p21
    wonjin = [(1,8),(2,7),(3,10),(4,9),(5,12),(6,11),(8,1),(7,2),(10,3),(9,4),(12,5),(11,6)]
    if (a3,a1) in wonjin or (a3,a2) in wonjin: score-=val0_p2; sal0[1]+=val0_p2
    if (b3,b1) in wonjin or (b3,b2) in wonjin: score-=val1_p2; sal1[1]+=val1_p2
    special = [(1,10),(2,7),(3,8),(4,9),(5,12),(6,11),(10,1),(7,2),(8,3),(9,4),(12,5),(11,6)]
    if (a1,a2) in special: score-=val0_p2; sal0[1]+=val0_p2
    if (b1,b2) in special: score-=val1_p2; sal1[1]+=val1_p2

    # [3] 형살
    if (a1==1 and a2==4) or (a1==1 and a3==4) or (a2==1 and a3==4): score-=p3; sal0[2]+=p3
    if (b1==1 and b2==4) or (b1==1 and b3==4) or (b2==1 and b3==4): score-=p3; sal1[2]+=p3
    self_h = [5,7,10,12]
    if a1 in self_h and (a2==a1 or a3==a1): score-=p3; sal0[2]+=p3
    if a2 in self_h and a3==a2: score-=p3; sal0[2]+=p3
    if b1 in self_h and (b2==b1 or b3==b1): score-=p3; sal1[2]+=p3
    if b2 in self_h and b3==b2: score-=p3; sal1[2]+=p3

    # [4] 충살
    if abs(a3-a2)==6: score-=p41; sal0[3]+=p41
    if abs(a3-a1)==6: score-=p42; sal0[3]+=p42
    if abs(a1-a2)==6: score-=p43; sal0[3]+=p43
    if abs(b3-b2)==6: score-=p41; sal1[3]+=p41
    if abs(b3-b1)==6: score-=p42; sal1[3]+=p42
    if abs(b1-b2)==6: score-=p43; sal1[3]+=p43

    # [5] 파살
    pa = [(1,10),(10,1),(2,5),(5,2),(3,12),(12,3),(4,7),(7,4),(6,9),(9,6),(11,8),(8,11)]
    if (a3,a2) in pa or (a3,a1) in pa: score-=p5; sal0[4]+=p5
    if (b3,b2) in pa or (b3,b1) in pa: score-=p5; sal1[4]+=p5

    # [6] 해살
    hae = [(1,8),(8,1),(2,7),(7,2),(3,6),(6,3),(4,5),(5,4),(9,12),(12,9),(10,11),(11,10)]
    if (a3,a2) in hae or (a3,a1) in hae: score-=p6; sal0[5]+=p6
    if (b3,b2) in hae or (b3,b1) in hae: score-=p6; sal1[5]+=p6

    # [7] 백호/괴강
    spec = [(5,5),(4,2),(3,11),(2,8),(1,5),(10,2),(9,11)]
    if (t0_d, a3) in spec: val=p7 if gender0 else p71; score-=val; sal0[6]+=val
    if (t1_d, b3) in spec: val=p7 if gender1 else p71; score-=val; sal1[6]+=val

    # [8] 성별 특수
    bad = [(9,5),(5,11),(7,5),(7,11)]
    if gender0!=1:
        if (t0_d, a3) in bad: score-=p81; sal0[7]+=p81
        if (t0_m, a2) in bad: score-=p82; sal0[7]+=p82
        if (t0_y, a1) in bad: score-=p83; sal0[7]+=p83
    if gender1!=1:
        if (t1_d, b3) in bad: score-=p81; sal1[7]+=p81
        if (t1_m, b2) in bad: score-=p82; sal1[7]+=p82
        if (t1_y, b1) in bad: score-=p83; sal1[7]+=p83

    return score, sal0, sal1

# ---------------------------------------------------------
# 4. 실행 및 출력 (Stdin 방식)
# ---------------------------------------------------------
if __name__ == '__main__':
    try:
        # [핵심 변경] sys.argv 대신 sys.stdin.read() 사용
        # Node.js가 보내준 데이터를 표준 입력(Stdin)으로 받습니다.
        input_stream = sys.stdin.read()
        
        if not input_stream:
            # 데이터가 안 들어왔으면 에러
            raise ValueError("No input data received")

        input_data = json.loads(input_stream)
        
        token0 = input_data['token0']
        token1 = input_data['token1']
        gender0 = int(input_data['gender0'])
        gender1 = int(input_data['gender1'])
        
        # AI 점수
        s_score = calculate_ai_score(token0[4], token1[4], 'sky')
        e_score = calculate_ai_score(token0[5], token1[5], 'earth')
        base_score = s_score + e_score
        
        if base_score > 100: base_score = 100
        
        # 살 계산
        final_score, sal0, sal1 = calculate_sal_logic(token0, token1, gender0, gender1, base_score)
        
        result = {
            "score": round(final_score, 1),
            "sal0": sal0,
            "sal1": sal1
        }
        
        # 결과 출력 (Node.js가 이걸 받음)
        print(json.dumps(result))
        
    except Exception as e:
        # 에러 발생 시 JSON 형태로 출력 (stderr 아님)
        error_res = {"error": str(e), "score": 0, "sal0": [], "sal1": []}
        print(json.dumps(error_res))